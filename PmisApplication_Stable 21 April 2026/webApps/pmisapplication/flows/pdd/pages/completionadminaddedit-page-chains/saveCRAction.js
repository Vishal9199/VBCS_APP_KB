define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class saveCompletionAction extends ActionChain {

    /**
     * Main entry point - validates before saving
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables, $application, $constants } = context;

      if ($variables.tenderProjectFormGroup === 'valid') {

        try {
          // Show saving notification
          await Actions.fireNotificationEvent(context, {
            summary: 'Saving...',
            message: 'Saving Completion data',
            type: 'info',
            displayMode: 'transient',
          });

          if ($variables.pNavCode === 'EDIT') {
            // ========== EDIT MODE ==========
            await this.updateCompletion(context);
          } else {
            // ========== CREATE MODE ==========
            await this.createCompletion(context);
          }

        } catch (error) {
          console.error('❌ Error saving Completion:', error);

          await Actions.fireNotificationEvent(context, {
            summary: 'Save Failed',
            message: 'Failed to save Completion: ' + error.message,
            type: 'error',
            displayMode: 'transient',
          });
        }
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please Fix required fields',
        });
      }
    }

    // ========================================================
    // HELPER - Format date for Oracle (YYYY-MM-DD)
    // ========================================================
    formatDateForOracle(dateValue) {
      if (!dateValue) return null;

      try {
        let date;
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          date = new Date(dateValue);
        } else {
          return null;
        }

        if (isNaN(date.getTime())) return null;

        const year  = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day   = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;

      } catch (error) {
        console.error('❌ Error formatting date:', error);
        return null;
      }
    }

    // ========================================================
    // HELPER - Reload page data after save (gets fresh DB values)
    // ========================================================
    async reloadPageData(context) {
      console.log('🔄 Reloading page data...');

      try {
        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });
        console.log('✅ Page data reloaded successfully');

      } catch (reloadError) {
        console.error('⚠️ Error reloading page data:', reloadError);

        await Actions.fireNotificationEvent(context, {
          summary: 'Warning',
          message: 'Data saved but failed to reload. Please refresh the page.',
          type: 'warning',
          displayMode: 'transient',
        });
      }
    }

    // ========================================================
    // EDIT MODE - UPDATE existing Completion
    // ========================================================
    async updateCompletion(context) {
      const { $variables, $application } = context;

      console.log('🔄 UPDATE MODE - Editing existing Completion');
      console.log('🔍 pNavId:', $variables.pNavId);
      console.log('🔍 pNavIdEncrypted:', $variables.pNavIdEncrypted);

      // Step 1: Encrypt method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'PUT' },
      });

      console.log('🔐 Method encrypted: PUT');

      // Step 2: Encrypt ID
      // ✅ If pNavId came from CREATE response it is already encrypted
      // ✅ If pNavId came from list navigation it is a raw number - needs encryption
      let encryptedId;
      if ($variables.pNavIdEncrypted === true) {
        // Already encrypted - came from CREATE response header
        encryptedId = $variables.pNavId;
        console.log('🔐 pNavId already encrypted, using directly');
      } else {
        // Raw number - came from list navigation, needs encryption
        encryptedId = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.pNavId },
        });
        console.log('🔐 pNavId encrypted from raw value');
      }

      // Step 3: Build payload
      const payload = {
        completion_id:              $variables.completionVar.completion_id,
        object_version_num:         $variables.completionVar.object_version_num,
        ora_project_id:             $variables.completionVar.ora_project_id,
        ora_project_number:         $variables.completionVar.ora_project_number,
        ora_project_name:           $variables.completionVar.ora_project_name,
        tender_id:                  $variables.completionVar.tender_id,
        tender_number:              $variables.completionVar.tender_number,
        tender_name:                $variables.completionVar.tender_name,
        five_year_plan_name:        $variables.completionVar.five_year_plan_name,
        supplier_id:                $variables.completionVar.supplier_id,
        supplier_name:              $variables.completionVar.supplier_name,
        consultant_name:            $variables.completionVar.consultant_name,
        commencement_date:          this.formatDateForOracle($variables.completionVar.commencement_date),
        completion_close_flag:      $variables.completionVar.completion_close_flag,
        completion_prime:           $variables.completionVar.completion_prime,
        orig_completion_date:       this.formatDateForOracle($variables.completionVar.orig_completion_date),
        extended_completion_date:   this.formatDateForOracle($variables.completionVar.extended_completion_date),
        actual_completion_date:     this.formatDateForOracle($variables.completionVar.actual_completion_date),
        additional_info:            $variables.completionVar.additional_info,
        created_by:                 $variables.completionVar.created_by,
        created_date:               $variables.completionVar.created_date,
        last_updated_by:            $application.user.email || 'CURRENT_USER',
        last_updated_login:         $application.user.email || 'CURRENT_USER',
      };

      console.log('📦 Update Payload:', payload);

      // Step 4: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payload },
      });

      console.log('🔐 Payload encrypted successfully');

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddCompletionadminProcess',
        headers: {
          'x-session-code': method,
          'x-session-id':   encryptedId, // ✅ correctly encrypted in both cases
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log('📥 ORDS Response:', response.body);

      // Step 6: Handle response
      if (response.body.P_ERR_CODE === 'S') {
        console.log('✅ Update successful');

        if (response.body.object_version_num) {
          $variables.completionVar.object_version_num = response.body.object_version_num;
          console.log('📝 Object version updated:', response.body.object_version_num);
        }

        // ✅ After a successful update, reset flag so next save re-encrypts from raw
        $variables.pNavIdEncrypted = false;

        await Actions.fireNotificationEvent(context, {
          summary: 'Updated Successfully',
          message: 'Completion updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // ✅ Reload to get fresh DB values
        await this.reloadPageData(context);

      } else {
        console.error('❌ Update failed:', response.body.P_ERR_MSG);

        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.P_ERR_MSG || 'Failed to update Completion',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========================================================
    // CREATE MODE - INSERT new Completion
    // ========================================================
    async createCompletion(context) {
      const { $variables, $application } = context;

      console.log('➕ CREATE MODE - Creating new Completion');

      // Step 1: Encrypt key for new record
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: '0' },
      });

      console.log('🔐 Key encrypted: 0');

      // Step 2: Encrypt method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'POST' },
      });

      console.log('🔐 Method encrypted: POST');

      // Step 3: Build payload
      const payload = {
        object_version_num:         $variables.completionVar.object_version_num,
        ora_project_id:             $variables.completionVar.ora_project_id,
        ora_project_number:         $variables.completionVar.ora_project_number,
        ora_project_name:           $variables.completionVar.ora_project_name,
        tender_id:                  $variables.completionVar.tender_id,
        tender_number:              $variables.completionVar.tender_number,
        tender_name:                $variables.completionVar.tender_name,
        five_year_plan_name:        $variables.completionVar.five_year_plan_name,
        supplier_id:                $variables.completionVar.supplier_id,
        supplier_name:              $variables.completionVar.supplier_name,
        consultant_name:            $variables.completionVar.consultant_name,
        commencement_date:          this.formatDateForOracle($variables.completionVar.commencement_date),
        completion_close_flag:      $variables.completionVar.completion_close_flag,
        completion_prime:           $variables.completionVar.completion_prime,
        orig_completion_date:       this.formatDateForOracle($variables.completionVar.orig_completion_date),
        extended_completion_date:   this.formatDateForOracle($variables.completionVar.extended_completion_date),
        actual_completion_date:     this.formatDateForOracle($variables.completionVar.actual_completion_date),
        additional_info:            $variables.completionVar.additional_info,
        created_by:                 $application.user.email || 'CURRENT_USER',
        last_updated_by:            $application.user.email || 'CURRENT_USER',
        last_updated_login:         $application.user.email || 'CURRENT_USER',
      };

      console.log('📦 Create Payload:', payload);

      // Step 4: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payload },
      });

      console.log('🔐 Payload encrypted successfully');

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddCompletionadminProcess',
        headers: {
          'x-session-code': method,
          'x-session-id':   encryptedKey,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log('📥 ORDS Response:', response.body);

      // Step 6: Handle response
      if (response.body.P_ERR_CODE === 'S') {
        console.log('✅ Create successful');

        // ✅ Get encrypted ID from response header (p_primarykey returned by PL/SQL)
        const newCompletionId = response.headers.get('X-Session-Id')
          || response.headers.get('x-session-id')
          || response.headers.get('X-session-id');

        const newObjectVersion = response.body.object_version_num || 1;

        console.log('🔑 New encrypted Completion ID:', newCompletionId);
        console.log('📝 Object version:', newObjectVersion);

        if (!newCompletionId) {
          throw new Error('Could not retrieve new Completion ID from response');
        }

        // ✅ Update object version
        $variables.completionVar.object_version_num = newObjectVersion;

        // ✅ Switch to EDIT mode
        // pNavId is set to already-encrypted value from PL/SQL response
        // pNavIdEncrypted = true so updateCompletion skips re-encryption
        $variables.pNavCode        = 'EDIT';
        $variables.pNavId          = newCompletionId;
        $variables.pNavIdEncrypted = true; // ✅ flag: no re-encryption needed

        console.log('🔄 Mode switched to EDIT, pNavId:', newCompletionId);

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: response.body.P_ERR_MSG || 'Completion created successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // ✅ Reload page data - loads fresh DB values including completion_id into completionVar
        await this.reloadPageData(context);

      } else {
        console.error('❌ Create failed:', response.body.P_ERR_MSG);

        await Actions.fireNotificationEvent(context, {
          summary: 'Create Failed',
          message: response.body.P_ERR_MSG || 'Failed to create Completion',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

  }

  return saveCompletionAction;
});