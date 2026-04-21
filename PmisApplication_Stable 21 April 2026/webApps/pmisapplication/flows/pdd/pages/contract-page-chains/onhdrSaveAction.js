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
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.pNavCode === 'CREATE') {
       let enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: 'POST',
          },
        });

       let enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: '0',
          },
        });

        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.postContractVar,
          },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddContractProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id': enc_key,
          },
          body: {
            payload: enc_payload,
          },
        });

        if (response.body.P_ERR_CODE === 'S') {
          $variables.pNavEncId = response.headers.get('X-Session-Id') || response.headers.get('x-session-id') ||
          response.headers.get('X-session-id');

          $variables.pNavCode = 'EDIT';

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
          });
        }
      } else {
        $variables.postContractVar.mobilization_start_date = await $application.functions.normalizeDate($variables.postContractVar.mobilization_start_date);
        $variables.postContractVar.mobilization_end_date = await $application.functions.normalizeDate($variables.postContractVar.mobilization_end_date);
        $variables.postContractVar.work_start_date = await $application.functions.normalizeDate($variables.postContractVar.work_start_date);
        $variables.postContractVar.work_completion_date = await $application.functions.normalizeDate($variables.postContractVar.work_completion_date);

        let enc_put_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: 'PUT',
          },
        });

        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.postContractVar,
          },
        });

        let enc_p_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.pNavId,
          },
        });

        const response2 = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddContractProcess',
          headers: {
            'x-session-code': enc_put_method,
            'x-session-id': enc_p_key,
          },
          body: {
            payload: enc_payload,
          },
        });

        if (response2.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
          });
        }
      }
    }
  }

  return onClickSave;
});
