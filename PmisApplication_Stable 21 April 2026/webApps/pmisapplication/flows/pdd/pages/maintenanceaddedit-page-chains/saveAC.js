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

  class saveAC extends ActionChain {

    /**
     * Main entry point - validates before saving
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ========== STEP 1: MANUAL NULL CHECK - TENDER REQUIRED ==========
      if (!$variables.maintenanceadminSearchVar.tender_id) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Required Fields Missing',
          message: 'Please select a Tender Number before saving.',
          type: 'error',
          displayMode: 'transient',
        });
        return;
      }

      // ========== STEP 2: VALIDATE SECTION 1 (Project Details) ==========
      const projectTracker = document.getElementById('maintenanceProjectValidation');

      if (projectTracker) {
        projectTracker.showMessages();
        projectTracker.focusOn('@firstInvalidShown');

        if (projectTracker.valid !== 'valid') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Please fix required fields in Project Details.',
            type: 'warning',
            displayMode: 'transient',
          });
          return;
        }
      }

      // ========== STEP 3: VALIDATE SECTION 2 (Contract Information) ==========
      const contractTracker = document.getElementById('maintenanceContractValidation');

      if (contractTracker) {
        contractTracker.showMessages();
        contractTracker.focusOn('@firstInvalidShown');

        if (contractTracker.valid !== 'valid') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Please fix required fields in Contract Information.',
            type: 'warning',
            displayMode: 'transient',
          });
          return;
        }
      }

      // ========== STEP 4: PROCEED TO SAVE ==========
      try {
        await Actions.fireNotificationEvent(context, {
          summary: 'Saving...',
          message: 'Saving Maintenance data',
          type: 'info',
          displayMode: 'transient',
        });

        if ($variables.pNavCode === 'EDIT') {
          // ========== EDIT MODE ==========
          await this.updateMaintenance(context);
        } else {
          // ========== CREATE MODE ==========
          await this.createMaintenance(context);
        }

      } catch (error) {
        console.error('❌ Error saving Maintenance:', error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Save Failed',
          message: 'Failed to save Maintenance: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========================================================
    // HELPER - Format date for Oracle (YYYY-MM-DD)
    // ========================================================
    formatDateForOracle(date) {
      if (!date) return null;
      const d = new Date(date);
      const year  = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day   = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // ========================================================
    // EDIT MODE - UPDATE existing Maintenance
    // ========================================================
    async updateMaintenance(context) {
      const { $variables, $application } = context;

      console.log('🔄 UPDATE MODE - Editing existing Maintenance');

      // Step 1: Encrypt method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'PUT' },
      });

      // Step 2: Build payload
      const payload = {
        maintenance_id:               $variables.maintenanceadminSearchVar.maintenance_id,
        object_version_num:           $variables.maintenanceadminSearchVar.object_version_num,
        ora_project_id:               $variables.maintenanceadminSearchVar.ora_project_id,
        ora_project_number:           $variables.maintenanceadminSearchVar.ora_project_number,
        ora_project_name:             $variables.maintenanceadminSearchVar.ora_project_name,
        tender_id:                    $variables.maintenanceadminSearchVar.tender_id,
        tender_number:                $variables.maintenanceadminSearchVar.tender_number,
        tender_name:                  $variables.maintenanceadminSearchVar.tender_name,
        fv_plan_name:                 $variables.maintenanceadminSearchVar.fv_plan_name,
        supplier_id:                  $variables.maintenanceadminSearchVar.supplier_id,
        supplier_name:                $variables.maintenanceadminSearchVar.supplier_name,
        consultant_name:              $variables.maintenanceadminSearchVar.consultant_name,
        contract_commencement_date:   this.formatDateForOracle($variables.maintenanceadminSearchVar.contract_commencement_date),
        orig_completion_date:         this.formatDateForOracle($variables.maintenanceadminSearchVar.orig_completion_date),
        rev_completion_date:          this.formatDateForOracle($variables.maintenanceadminSearchVar.rev_completion_date),
        actual_completion_date:       this.formatDateForOracle($variables.maintenanceadminSearchVar.actual_completion_date),
        substantial_completion_date:  this.formatDateForOracle($variables.maintenanceadminSearchVar.substantial_completion_date),
        maintenance_period:           this.formatDateForOracle($variables.maintenanceadminSearchVar.maintenance_period),
        end_maintenance_period:       this.formatDateForOracle($variables.maintenanceadminSearchVar.end_maintenance_period),
        additional_info:              $variables.maintenanceadminSearchVar.additional_info,
        created_by:                   $variables.maintenanceadminSearchVar.created_by,
        created_date:                 $variables.maintenanceadminSearchVar.created_date,
        last_updated_by:              $application.user.email || 'CURRENT_USER',
        last_updated_date:            $application.functions.getSysdate,
        last_updated_login:           $application.user.email || 'CURRENT_USER',
      };

      console.log('📦 Update Payload:', payload);

      // Step 3: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payload },
      });

      // Step 4: Encrypt ID
      const encrypted_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: $variables.pNavId },
      });

      console.log('🔐 Payload encrypted');

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddMaintenanceProcess2',
        headers: {
          'x-session-code': method,
          'x-session-id': encrypted_id,
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
          $variables.maintenanceadminSearchVar.object_version_num = response.body.object_version_num + 1;
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Updated Successfully',
          message: 'Maintenance updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

      } else {
        console.error('❌ Update failed:', response.body.P_ERR_MSG);

        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.P_ERR_MSG || 'Failed to update Maintenance',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========================================================
    // CREATE MODE - INSERT new Maintenance
    // ========================================================
    async createMaintenance(context) {
      const { $variables, $application } = context;

      console.log('➕ CREATE MODE - Creating new Maintenance');

      // Step 1: Encrypt key for new record
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: '0' },
      });

      // Step 2: Encrypt method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'POST' },
      });

      // Step 3: Build payload
      const payload = {
        maintenance_id:               0,
        object_version_num:           0,
        ora_project_id:               $variables.maintenanceadminSearchVar.ora_project_id,
        ora_project_number:           $variables.maintenanceadminSearchVar.ora_project_number,
        ora_project_name:             $variables.maintenanceadminSearchVar.ora_project_name,
        tender_id:                    $variables.maintenanceadminSearchVar.tender_id,
        tender_number:                $variables.maintenanceadminSearchVar.tender_number,
        tender_name:                  $variables.maintenanceadminSearchVar.tender_name,
        fv_plan_name:                 $variables.maintenanceadminSearchVar.fv_plan_name,
        supplier_id:                  $variables.maintenanceadminSearchVar.supplier_id,
        supplier_name:                $variables.maintenanceadminSearchVar.supplier_name,
        consultant_name:              $variables.maintenanceadminSearchVar.consultant_name,
        contract_commencement_date:   this.formatDateForOracle($variables.maintenanceadminSearchVar.contract_commencement_date),
        orig_completion_date:         this.formatDateForOracle($variables.maintenanceadminSearchVar.orig_completion_date),
        rev_completion_date:          this.formatDateForOracle($variables.maintenanceadminSearchVar.rev_completion_date),
        actual_completion_date:       this.formatDateForOracle($variables.maintenanceadminSearchVar.actual_completion_date),
        substantial_completion_date:  this.formatDateForOracle($variables.maintenanceadminSearchVar.substantial_completion_date),
        maintenance_period:           this.formatDateForOracle($variables.maintenanceadminSearchVar.maintenance_period),
        end_maintenance_period:       this.formatDateForOracle($variables.maintenanceadminSearchVar.end_maintenance_period),
        additional_info:              $variables.maintenanceadminSearchVar.additional_info,
        created_by:                   $application.user.email || 'CURRENT_USER',
        created_date:                 $application.functions.getSysdate,
        last_updated_by:              $application.user.email || 'CURRENT_USER',
        last_updated_date:            $application.functions.getSysdate,
        last_updated_login:           $application.user.email || 'CURRENT_USER',
      };

      console.log('📦 Create Payload:', payload);

      // Step 4: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payload },
      });

      console.log('🔐 Payload encrypted');

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddMaintenanceProcess2',
        headers: {
          'x-session-code': method,
          'x-session-id': encryptedKey,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log('📥 ORDS Response:', response.body);

      // Step 6: Handle response
      if (response.body.P_ERR_CODE === 'S') {
        console.log('✅ Create successful');

        await Actions.fireNotificationEvent(context, {
          summary: 'Maintenance created successfully.',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // Retrieve new record ID from response header
        const newMaintenanceId = response.headers.get('X-Session-Id')
          || response.headers.get('x-session-id')
          || response.headers.get('X-session-id');

        const newObjectVersion = response.body.object_version_num || 1;

        // Update object version
        $variables.maintenanceadminSearchVar.object_version_num = newObjectVersion;

        // ========== SWITCH TO EDIT MODE ==========
        $variables.pNavCode = 'EDIT';
        $variables.pNavId   = newMaintenanceId;

        console.log('🔄 Mode switched to EDIT, new Maintenance ID:', newMaintenanceId);

      } else {
        console.error('❌ Create failed:', response.body.P_ERR_MSG);

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Failed to create Maintenance',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

  }

  return saveAC;
});