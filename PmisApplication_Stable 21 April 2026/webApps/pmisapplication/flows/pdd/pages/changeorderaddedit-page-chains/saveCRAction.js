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

  class saveCRAction extends ActionChain {

    async run(context) {
      const { $page, $variables, $application, $constants } = context;

      if ($variables.formValidationInitiator === 'valid' && $variables.formValidationChangeDetails === 'valid') {

        try {
          await Actions.fireNotificationEvent(context, {
            summary: 'Saving...',
            message: 'Saving Change Request data',
            type: 'info',
            displayMode: 'transient',
          });

          if ($variables.pNavCode === 'EDIT') {
            await this.updateCR(context);
          } else {
            await this.createCR(context);
          }

        } catch (error) {
          console.error('❌ Error saving Change Request:', error);
          await Actions.fireNotificationEvent(context, {
            summary: 'Save Failed',
            message: 'Failed to save Change Request: ' + error.message,
            type: 'error',
            displayMode: 'transient',
          });
        }

      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please fix the required field(s)',
          displayMode: 'transient',
          type: 'warning',
        });
      }
    }

    getCurrentDate() {
      const d = new Date();
      const year  = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day   = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    formatDateForOracle(date) {
      if (!date) return null;
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        const year  = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day   = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (e) {
        return null;
      }
    }

    toNum(value) {
      if (value === null || value === undefined || value === '') return null;
      const n = Number(value);
      return isNaN(n) ? null : n;
    }

    // ✅ Fetch fresh record directly - NO vbEnterListener, NO encryption side effects
    async fetchCRById(context, encryptedId) {
      console.log('🔄 Fetching fresh CR data with encryptedId:', encryptedId);
      try {
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddChangeorderGetbyid',
          headers: { 'x-session-id': encryptedId },
        });
        if (response.body.count >= 1) {
          context.$variables.crDetailVar = response.body.items[0];
          console.log('✅ CR data fetched:', context.$variables.crDetailVar);
        }
      } catch (error) {
        console.error('⚠️ Error fetching CR:', error);
      }
    }

    async updateCR(context) {
      const { $variables, $application } = context;

      console.log('🔄 UPDATE MODE');
      console.log('🔍 pNavId:', $variables.pNavId);

      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'PUT' },
      });

      // ✅ pNavId is ALWAYS already encrypted at this point:
      //    - From list: vbEnterListener encrypts raw ID, stores back, never called again
      //    - From CREATE: newCRId stored directly, fetchCRById used (not vbEnterListener)
      const payload = {
        change_request_id:            this.toNum($variables.crDetailVar.change_request_id),
        object_version_num:           this.toNum($variables.crDetailVar.object_version_num) || 1,
        ora_project_id:               this.toNum($variables.projectObj.ora_project_id),
        tender_id:                    this.toNum($variables.projectObj.tender_id),
        cr_number:                    $variables.crDetailVar.cr_number,
        title:                        $variables.crDetailVar.title,
        initiator:                    $variables.crDetailVar.initiator,
        position:                     $variables.crDetailVar.position,
        department_id:                this.toNum($variables.crDetailVar.department_id),
        cr_date:                      this.formatDateForOracle($variables.crDetailVar.cr_date),
        time_impact:                  this.toNum($variables.crDetailVar.time_impact),
        cost_impact:                  this.toNum($variables.crDetailVar.cost_impact),
        time_frame:                   $variables.crDetailVar.time_frame,
        description:                  $variables.crDetailVar.description,
        relation_to_original_scope:   $variables.crDetailVar.relation_to_original_scope,
        importance_and_justification: $variables.crDetailVar.importance_and_justification,
        wf_item_type:                 $variables.crDetailVar.wf_item_type,
        wf_item_key:                  $variables.crDetailVar.wf_item_key,
        status_id:                    this.toNum($variables.crDetailVar.status_id),
        additional_info:              $variables.crDetailVar.additional_info,
        created_by:                   $variables.crDetailVar.created_by,
        created_date:                 $variables.crDetailVar.created_date,
        last_updated_by:              $application.user.email || 'CURRENT_USER',
        last_updated_date:            this.getCurrentDate(),
        last_updated_login:           $application.user.email || 'CURRENT_USER',
      };

      console.log('📦 Update Payload:', payload);

      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payload },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddChangeorderProcess',
        headers: {
          'x-session-code': method,
          'x-session-id':   $variables.pNavId, // ✅ always encrypted, use directly
        },
        body: { payload: encryptedPayload },
      });

      console.log('📥 ORDS Response:', response.body);

      if (response.body.P_ERR_CODE === 'S') {
        console.log('✅ Update successful');

        if (response.body.object_version_num) {
          $variables.crDetailVar.object_version_num = response.body.object_version_num + 1;
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Updated Successfully',
          message: 'Change Request updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // ✅ Fetch fresh record directly - no vbEnterListener, no double encryption
        await this.fetchCRById(context, $variables.pNavId);

      } else {
        console.error('❌ Update failed:', response.body.P_ERR_MSG);
        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.P_ERR_MSG || 'Failed to update Change Request',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    async createCR(context) {
      const { $variables, $application } = context;

      console.log('➕ CREATE MODE');

      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: '0' },
      });

      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'POST' },
      });

      const payload = {
        change_request_id:            0,
        object_version_num:           0,
        ora_project_id:               this.toNum($variables.projectObj.ora_project_id),
        tender_id:                    this.toNum($variables.projectObj.tender_id),
        cr_number:                    $variables.crDetailVar.cr_number,
        title:                        $variables.crDetailVar.title,
        initiator:                    $variables.crDetailVar.initiator,
        position:                     $variables.crDetailVar.position,
        department_id:                this.toNum($variables.crDetailVar.department_id),
        cr_date:                      this.formatDateForOracle($variables.crDetailVar.cr_date),
        time_impact:                  this.toNum($variables.crDetailVar.time_impact),
        cost_impact:                  this.toNum($variables.crDetailVar.cost_impact),
        time_frame:                   $variables.crDetailVar.time_frame,
        description:                  $variables.crDetailVar.description,
        relation_to_original_scope:   $variables.crDetailVar.relation_to_original_scope,
        importance_and_justification: $variables.crDetailVar.importance_and_justification,
        wf_item_type:                 null,
        wf_item_key:                  null,
        status_id:                    null,
        additional_info:              $variables.crDetailVar.additional_info,
        created_by:                   $application.user.email || 'CURRENT_USER',
        created_date:                 this.getCurrentDate(),
        last_updated_by:              $application.user.email || 'CURRENT_USER',
        last_updated_date:            this.getCurrentDate(),
        last_updated_login:           $application.user.email || 'CURRENT_USER',
      };

      console.log('📦 Create Payload:', payload);

      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payload },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddChangeorderProcess',
        headers: {
          'x-session-code': method,
          'x-session-id':   encryptedKey,
        },
        body: { payload: encryptedPayload },
      });

      console.log('📥 ORDS Response:', response.body);

      if (response.body.P_ERR_CODE === 'S') {
        console.log('✅ Create successful');

        let newCRId = response.headers.get('X-Session-Id')
          || response.headers.get('x-session-id')
          || response.headers.get('X-session-id');

        if (!newCRId) {
          const msgMatch = (response.body.P_ERR_MSG || '').match(/header id:\s*(\d+)/i);
          if (msgMatch) {
            const rawId = msgMatch[1];
            console.log('🔑 Got raw ID from P_ERR_MSG:', rawId);
            newCRId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: rawId },
            });
          }
        }

        console.log('🔑 New CR ID:', newCRId);

        if (!newCRId) {
          throw new Error('Could not retrieve new CR ID from response');
        }

        // ✅ Switch to EDIT, store encrypted ID
        $variables.pNavCode = 'EDIT';
        $variables.pNavId   = newCRId;

        $variables.crDetailVar.object_version_num = response.body.object_version_num || 1;

        console.log('🔄 Mode switched to EDIT, pNavId:', newCRId);

        await Actions.fireNotificationEvent(context, {
          summary: 'Change Request created successfully.',
          type: 'confirmation',
          displayMode: 'transient',
        });

        // ✅ Fetch fresh record directly - no vbEnterListener, no double encryption
        await this.fetchCRById(context, newCRId);

      } else {
        console.error('❌ Create failed:', response.body.P_ERR_MSG);
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Failed to create Change Request',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

  }

  return saveCRAction;
});