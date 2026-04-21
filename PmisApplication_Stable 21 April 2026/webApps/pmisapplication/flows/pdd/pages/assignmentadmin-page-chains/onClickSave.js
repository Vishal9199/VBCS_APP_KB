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

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const submittableItems = await $page.variables.projectAssignmentBDP.instance.getSubmittableItems();

      await this.setStatusTo(context, { pstatus: 'submitting' });

      const filteredItems = submittableItems.filter(item => {
        if (item.operation === 'update') {
          const current = item.item.data;
          const original = item.item.metadata.originalData || {};
          //return this.isRowChanged(current, original);
        }
        return true; // Keep adds and deletes
      });

      let successAdd = 0;
      let successUpdate = 0;
      let failedItems = [];

      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });

        await this.setStatusTo(context, { pstatus: 'submitted' });
        await $page.variables.projectAssignmentBDP.instance.resetAllUnsubmittedItems();
        return;
      }

      const results = await ActionUtils.forEach(filteredItems, async (item, index) => {

        const op = item.operation;
        const payload = item.item.data;
        const rowKey = item.item.metadata.key;

        try {
          if (op === 'add') {
            let encyp_key = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: '0',
              },
            });

            let enc_method = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: 'POST',
              },
            });

            let enc_payload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: payload,
              },
            });

            const response2 = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddProjectassProcess',
              headers: {
                'x-session-code': enc_method,
                'x-session-id': encyp_key,
              },
              body: {
                payload: enc_payload,
              },
            });

            if (response2.body.P_ERR_CODE === 'S') {
              successAdd++;
            } else {
              // Show error message from API response
              await Actions.fireNotificationEvent(context, {
                summary: response2.body.P_ERR_MSG || 'Add operation failed.',
                type: 'error',
                displayMode: 'transient',
              });
              failedItems.push(`ADD - ${rowKey}: ${response2.body.P_ERR_MSG || 'Unknown error'}`);
            }

          } else if (op === 'update') {
            let enc_pkey = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: payload.project_assignment_id,
              },
            });

            let enc_put_meth = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: 'PUT',
              },
            });

            let enc_put_pay = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: payload,
              },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddProjectassProcess',
              headers: {
                'x-session-id': enc_pkey,
                'x-session-code': enc_put_meth,
              },
              body: {
                payload: enc_put_pay,
              },
            });

            if (response.body.P_ERR_CODE === 'S') {
              successUpdate++;
            } else {
              // Show error message from API response
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG || 'Update operation failed.',
                type: 'error',
                displayMode: 'transient',
              });
              failedItems.push(`UPDATE - ${rowKey}: ${response.body.P_ERR_MSG || 'Unknown error'}`);
            }
          }

        } catch (e) {
          failedItems.push(`${op.toUpperCase()} - ${rowKey}: ${e.message}`);
          await Actions.fireNotificationEvent(context, {
            summary: `Operation failed for row ${rowKey}: ${e.message}`,
            type: 'error',
            displayMode: 'transient',
          });
        }

      }, { mode: 'serial' });

      // Show summary notifications after all operations are done
      if (failedItems.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: `${failedItems.length} operation(s) failed: ${failedItems.join(' | ')}`,
          type: 'error',
          displayMode: 'transient',
        });
      }

      if (successAdd > 0 || successUpdate > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: `Saved successfully: ${successAdd} added, ${successUpdate} updated.`,
          type: 'confirmation',
          displayMode: 'transient',
        });
      }

      await this.setStatusTo(context, { pstatus: 'submitted' });
      await $page.variables.projectAssignmentBDP.instance.resetAllUnsubmittedItems();

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });
    }

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.pstatus
     */
    async setStatusTo(context, { pstatus }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const editItems = await $page.variables.projectAssignmentBDP.instance.getSubmittableItems();
      editItems.forEach(editItem => {
        $page.variables.projectAssignmentBDP.instance.setItemStatus(editItem, pstatus);
      });
      return editItems;
    }
  }

  return onClickSave;
});