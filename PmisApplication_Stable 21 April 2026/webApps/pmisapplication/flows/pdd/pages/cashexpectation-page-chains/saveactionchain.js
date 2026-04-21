define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class saveactionchain extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $application } = context;

      const submittableItems = 
        await $page.variables.bufferDPcahExpTable.instance.getSubmittableItems();

      const filteredItems = submittableItems.filter(
        item => item.operation !== 'remove'
      );

      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });
        await $page.variables.bufferDPcahExpTable.instance.resetAllUnsubmittedItems();
        return;
      }

      await this.setStatusTo(context, { pstatus: 'submitting' });

      let successAdd = 0;
      let successUpdate = 0;
      let failedItems = [];
      let lastSuccessMsg = '';

      await ActionUtils.forEach(filteredItems, async (item) => {
        const op = item.operation;
        const rawPayload = item.item.data;
        const rowKey = item.item.metadata.key;

        const payload = {
          cash_expectation_id: rawPayload.cash_expectation_id,
          object_version_num:  rawPayload.object_version_num,
          project_id:          rawPayload.project_id,
          year:                rawPayload.year,
          type:                rawPayload.type,
          jan_curr_year:       rawPayload.jan_curr_year,
          jan_next_year:       rawPayload.jan_next_year,
          feb_curr_year:       rawPayload.feb_curr_year,
          feb_next_year:       rawPayload.feb_next_year,
          mar_curr_year:       rawPayload.mar_curr_year,
          mar_next_year:       rawPayload.mar_next_year,
          apr_curr_year:       rawPayload.apr_curr_year,
          apr_next_year:       rawPayload.apr_next_year,
          may_curr_year:       rawPayload.may_curr_year,
          may_next_year:       rawPayload.may_next_year,
          jun_curr_year:       rawPayload.jun_curr_year,
          jun_next_year:       rawPayload.jun_next_year,
          jul_curr_year:       rawPayload.jul_curr_year,
          jul_next_year:       rawPayload.jul_next_year,
          aug_curr_year:       rawPayload.aug_curr_year,
          aug_next_year:       rawPayload.aug_next_year,
          sep_curr_year:       rawPayload.sep_curr_year,
          sep_next_year:       rawPayload.sep_next_year,
          oct_curr_year:       rawPayload.oct_curr_year,
          oct_next_year:       rawPayload.oct_next_year,
          nov_curr_year:       rawPayload.nov_curr_year,
          nov_next_year:       rawPayload.nov_next_year,
          dec_curr_year:       rawPayload.dec_curr_year,
          dec_next_year:       rawPayload.dec_next_year,
          additional_info:     rawPayload.additional_info,
          created_by:          rawPayload.created_by,
          created_date:        rawPayload.created_date,
          last_updated_by:     rawPayload.last_updated_by,
          last_updated_date:   rawPayload.last_updated_date,
          last_updated_login:  rawPayload.last_updated_login,
        };

        try {
          if (op === 'add') {
            const enc_key = await Actions.callChain(context, {
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
              endpoint: 'PDD/postPmispddCashexpectationProcess',
              headers: {
                'x-session-code': enc_method,
                'x-session-id': enc_key,
              },
              body: { payload: enc_payload },
            });

            if (response.body.P_ERR_CODE === 'S' || 
                response.body.P_ERR_CODE === 's') {
              successAdd++;
              lastSuccessMsg = response.body.P_ERR_MSG;
            } else {
              failedItems.push(response.body.P_ERR_MSG);
            }

          } else if (op === 'update') {
            const enc_key = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload.cash_expectation_id },
            });
            const enc_method = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });
            const enc_payload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddCashexpectationProcess',
              headers: {
                'x-session-code': enc_method,
                'x-session-id': enc_key,
              },
              body: { payload: enc_payload },
            });

            if (response.body.P_ERR_CODE === 'S' || 
                response.body.P_ERR_CODE === 's') {
              successUpdate++;
              lastSuccessMsg = response.body.P_ERR_MSG;
            } else {
              failedItems.push(response.body.P_ERR_MSG);
            }
          }

        } catch (e) {
          failedItems.push(`${op.toUpperCase()} - Row ${rowKey}: ${e.message}`);
        }

      }, { mode: 'serial' });

      await this.setStatusTo(context, { pstatus: 'submitted' });
      await $page.variables.bufferDPcahExpTable.instance.resetAllUnsubmittedItems();

      if (failedItems.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: `Saved with errors. Added: ${successAdd}, Updated: ${successUpdate}`,
          message: failedItems.join('\n'),
          type: 'warning',
          displayMode: 'persist',
        });
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: lastSuccessMsg,
          type: 'confirmation',
          displayMode: 'transient',
        });
      }

      // Reload table
      await Actions.callChain(context, { chain: 'cashExpectationonLoad' });
    }

    async setStatusTo(context, { pstatus }) {
      const { $page } = context;
      const editItems = 
        await $page.variables.bufferDPcahExpTable.instance.getSubmittableItems();
      editItems.forEach(editItem => {
        $page.variables.bufferDPcahExpTable.instance.setItemStatus(
          editItem, pstatus
        );
      });
    }
  }

  return saveactionchain;
});