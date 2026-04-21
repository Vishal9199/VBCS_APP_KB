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

  class onClickSave extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const currentUser = $application.user.username;
      const currentDate = this.formatDate($application.functions.getSysdate());
      const tenderId    = $variables.projectHeaderVar.tender_id;
      const projectId   = $variables.projectHeaderVar.project_id;

      const submittableItems = await $page.variables.bufferDPChangeControlTable.instance.getSubmittableItems();

      const filteredItems = submittableItems.filter(item => item.operation !== 'remove');

      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });
        await this.setStatusTo(context, { pstatus: 'submitted' });
        await $page.variables.bufferDPChangeControlTable.instance.resetAllUnsubmittedItems();
        return;
      }

      // ── Validation: check required fields before saving ────────────────
      const invalidRows = [];
      filteredItems.forEach((item, index) => {
        const data = item.item.data;
        const rowNum = index + 1;
        const errors = [];

        if (!tenderId) {
          errors.push('Tender ID');
        }
        if (!projectId) {
          errors.push('Project ID');
        }
        if (!data.change_request_id) {
          errors.push('CR No');
        }
        if (!data.project_manager || data.project_manager.trim() === '') {
          errors.push('Project Manager');
        }
        if (!data.initiator || data.initiator.trim() === '') {
          errors.push('Initiator');
        }
        if (data.time_impact === null || data.time_impact === undefined || data.time_impact === '') {
          errors.push('EOT Days');
        }
        if (data.addition_a === null || data.addition_a === undefined || data.addition_a === '') {
          errors.push('Addition (A)');
        }
        if (data.omission_b === null || data.omission_b === undefined || data.omission_b === '') {
          errors.push('Omission (B)');
        }

        if (errors.length > 0) {
          invalidRows.push(`Row ${rowNum}: Missing ${errors.join(', ')}`);
        }
      });

      if (invalidRows.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: `Please fill required fields:\n${invalidRows.join('\n')}`,
          type: 'error',
          displayMode: 'persist',
        });
        return;
      }

      await this.setStatusTo(context, { pstatus: 'submitting' });

      let successAdd    = 0;
      let successUpdate = 0;
      let failedItems   = [];

      await ActionUtils.forEach(filteredItems, async (item, index) => {
        const op         = item.operation;
        const rawPayload = item.item.data;
        const rowKey     = item.item.metadata.key;

        try {
          if (op === 'add') {
            const payload = {
              'tender_id':                 parseInt(tenderId, 10),
              'ora_project_id':            parseInt(projectId, 10),
              'change_request_id':         rawPayload.change_request_id ? parseInt(rawPayload.change_request_id, 10) : null,
              'vo_number':                 rawPayload.vo_number ?? null,
              'change_control_number':     rawPayload.change_control_number ? parseInt(rawPayload.change_control_number, 10) : null,
              'project_manager':           rawPayload.project_manager ?? null,
              'initiator':                 rawPayload.initiator ?? null,
              'time_impact':               rawPayload.time_impact ? parseFloat(rawPayload.time_impact) : 0,
              'original_contract_value':   rawPayload.original_contract_value ? parseFloat(rawPayload.original_contract_value) : null,
              'revised_contract_amount':   rawPayload.revised_contract_amount ? parseFloat(rawPayload.revised_contract_amount) : null,
              'addition_a':                rawPayload.addition_a ? parseFloat(rawPayload.addition_a) : 0,
              'omission_b':                rawPayload.omission_b ? parseFloat(rawPayload.omission_b) : 0,
              'total_change':              rawPayload.total_change ? parseFloat(rawPayload.total_change) : 0,
              'net_change':                rawPayload.net_change ? parseFloat(rawPayload.net_change) : 0,
              'net_percentage_of_change':  rawPayload.net_percentage_of_change ? parseFloat(rawPayload.net_percentage_of_change) : 0,
              'total_vol_of_change':       rawPayload.total_vol_of_change ? parseFloat(rawPayload.total_vol_of_change) : 0,
              'status':                    rawPayload.status ?? 'Open',
              'open_reason_id':            rawPayload.open_reason_id ? parseInt(rawPayload.open_reason_id, 10) : null,
              'remarks':                   rawPayload.remarks ?? null,
              'additional_info':           rawPayload.additional_info ?? null,
              'object_version_num':        0,
              'created_by':                currentUser,
              'created_date':              currentDate,
              'last_updated_by':           currentUser,
              'last_updated_date':         currentDate,
              'last_updated_login':        currentUser,
            };

            console.log('➕ ADD Payload:', JSON.stringify(payload));

            const encyp_key = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: '0' },
            });

            const enc_method = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'POST' },
            });

            const enc_payload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddChangecontrolProcess',
              headers: {
                'x-session-id':   encyp_key,
                'x-session-code': enc_method,
              },
              body: { payload: enc_payload },
            });

            console.log('📥 ADD Response:', JSON.stringify(response.body));

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successAdd++;
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`ADD - Row ${index + 1}: ${response.body.P_ERR_MSG}`);
            }

          } else if (op === 'update') {
            const payload = {
              'control_register_id':       parseInt(rawPayload.control_register_id, 10),
              'object_version_num':        parseInt(rawPayload.object_version_num, 10),
              'tender_id':                 parseInt(tenderId, 10),
              'ora_project_id':            parseInt(projectId, 10),
              'change_request_id':         rawPayload.change_request_id ? parseInt(rawPayload.change_request_id, 10) : null,
              'vo_number':                 rawPayload.vo_number ?? null,
              'change_control_number':     rawPayload.change_control_number ? parseInt(rawPayload.change_control_number, 10) : null,
              'project_manager':           rawPayload.project_manager ?? null,
              'initiator':                 rawPayload.initiator ?? null,
              'time_impact':               rawPayload.time_impact ? parseFloat(rawPayload.time_impact) : 0,
              'original_contract_value':   rawPayload.original_contract_value ? parseFloat(rawPayload.original_contract_value) : null,
              'revised_contract_amount':   rawPayload.revised_contract_amount ? parseFloat(rawPayload.revised_contract_amount) : null,
              'addition_a':                rawPayload.addition_a ? parseFloat(rawPayload.addition_a) : 0,
              'omission_b':                rawPayload.omission_b ? parseFloat(rawPayload.omission_b) : 0,
              'total_change':              rawPayload.total_change ? parseFloat(rawPayload.total_change) : 0,
              'net_change':                rawPayload.net_change ? parseFloat(rawPayload.net_change) : 0,
              'net_percentage_of_change':  rawPayload.net_percentage_of_change ? parseFloat(rawPayload.net_percentage_of_change) : 0,
              'total_vol_of_change':       rawPayload.total_vol_of_change ? parseFloat(rawPayload.total_vol_of_change) : 0,
              'status':                    rawPayload.status ?? 'Open',
              'open_reason_id':            rawPayload.open_reason_id ? parseInt(rawPayload.open_reason_id, 10) : null,
              'remarks':                   rawPayload.remarks ?? null,
              'additional_info':           rawPayload.additional_info ?? null,
              'created_by':                rawPayload.created_by,
              'created_date':              this.formatDate(rawPayload.created_date),
              'last_updated_by':           currentUser,
              'last_updated_date':         currentDate,
              'last_updated_login':        currentUser,
            };

            console.log('🔄 UPDATE Payload:', JSON.stringify(payload));

            const enc_pkey = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload.control_register_id },
            });

            const enc_put_meth = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });

            const enc_put_pay = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddChangecontrolProcess',
              headers: {
                'x-session-id':   enc_pkey,
                'x-session-code': enc_put_meth,
              },
              body: { payload: enc_put_pay },
            });

            console.log('📥 UPDATE Response:', JSON.stringify(response.body));

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successUpdate++;
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`UPDATE - Row ${index + 1}: ${response.body.P_ERR_MSG}`);
            }
          }

        } catch (e) {
          console.error(`Error on ${op} row ${index + 1}:`, e);
          failedItems.push(`${op.toUpperCase()} - Row ${index + 1}: ${e.message}`);
        }

      }, { mode: 'serial' });

      await this.setStatusTo(context, { pstatus: 'submitted' });
      await $page.variables.bufferDPChangeControlTable.instance.resetAllUnsubmittedItems();

      if (failedItems.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: `Saved with errors. Added: ${successAdd}, Updated: ${successUpdate}`,
          message: failedItems.join('\n'),
          type: 'warning',
          displayMode: 'persist',
        });
      }

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });
    }

    formatDate(dateStr) {
      if (!dateStr) return null;
      return dateStr.toString().substring(0, 10);
    }

    async setStatusTo(context, { pstatus }) {
      const { $page } = context;
      const editItems = await $page.variables.bufferDPChangeControlTable.instance.getSubmittableItems();
      editItems.forEach(editItem => {
        $page.variables.bufferDPChangeControlTable.instance.setItemStatus(editItem, pstatus);
      });
      return editItems;
    }
  }

  return onClickSave;
});