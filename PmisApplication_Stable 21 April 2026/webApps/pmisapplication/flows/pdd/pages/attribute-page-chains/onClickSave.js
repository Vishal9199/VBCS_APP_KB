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
      const currentDate = $application.functions.getSysdate();
      const tenderId    = $variables.tenderid;
      const projectId   = $page.variables.pProjectId;

      const submittableItems = await $page.variables.bufferDPHeaderTable.instance.getSubmittableItems();

      const filteredItems = submittableItems.filter(item => item.operation !== 'remove');

      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });
        await this.setStatusTo(context, { pstatus: 'submitted' });
        await $page.variables.bufferDPHeaderTable.instance.resetAllUnsubmittedItems();
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
        if (!data.activity_id) {
          errors.push('Description');
        }
        if (data.quantity === null || data.quantity === undefined || data.quantity === '') {
          errors.push('Quantity');
        }
        if (!data.unit_of_measurement) {
          errors.push('Unit of Measurement');
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
              tender_id:           tenderId,
              ora_project_id:      projectId,
              activity_id:         rawPayload.activity_id,
              quantity:            rawPayload.quantity,
              unit_of_measurement: rawPayload.unit_of_measurement,
              activity_remark:     rawPayload.activity_remark,
              additional_info:     rawPayload.additional_info ?? null,
              object_version_num:  0,
              created_by:          currentUser,
              created_date:        currentDate,
              last_updated_by:     currentUser,
              last_updated_date:   currentDate,
              last_updated_login:  currentUser,
            };

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
              endpoint: 'PDD/postPmispddAttributesProcess',
              headers: {
                'x-session-id':   encyp_key,
                'x-session-code': enc_method,
              },
              body: { payload: enc_payload },
            });

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
              attribute_header_id: rawPayload.attribute_header_id,
              object_version_num:  rawPayload.object_version_num,
              tender_id:           tenderId,
              ora_project_id:      projectId,
              activity_id:         rawPayload.activity_id,
              quantity:            rawPayload.quantity,
              unit_of_measurement: rawPayload.unit_of_measurement,
              activity_remark:     rawPayload.activity_remark,
              additional_info:     rawPayload.additional_info ?? null,
              created_by:          rawPayload.created_by,
              created_date:        rawPayload.created_date,
              last_updated_by:     currentUser,
              last_updated_date:   currentDate,
              last_updated_login:  currentUser,
            };

            const enc_pkey = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload.attribute_header_id },
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
              endpoint: 'PDD/postPmispddAttributesProcess',
              headers: {
                'x-session-id':   enc_pkey,
                'x-session-code': enc_put_meth,
              },
              body: { payload: enc_put_pay },
            });

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
          failedItems.push(`${op.toUpperCase()} - Row ${index + 1}: ${e.message}`);
        }

      }, { mode: 'serial' });

      await this.setStatusTo(context, { pstatus: 'submitted' });
      await $page.variables.bufferDPHeaderTable.instance.resetAllUnsubmittedItems();

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

    async setStatusTo(context, { pstatus }) {
      const { $page } = context;
      const editItems = await $page.variables.bufferDPHeaderTable.instance.getSubmittableItems();
      editItems.forEach(editItem => {
        $page.variables.bufferDPHeaderTable.instance.setItemStatus(editItem, pstatus);
      });
      return editItems;
    }
  }

  return onClickSave;
});