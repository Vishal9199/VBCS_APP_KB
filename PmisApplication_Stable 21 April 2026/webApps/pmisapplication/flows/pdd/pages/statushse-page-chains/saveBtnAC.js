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

  class saveBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.pNavCode === 'CREATE') {
        let enc_key = await Actions.callChain(context, {
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
            input: $variables.getPmispddStatushseGetbytenderidVar,
          },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddStatushseProcess',
          headers: {
            'x-session-id': enc_key,
            'x-session-code': enc_method,
          },
          body: {
            payload: enc_payload,
          },
        });

        if (response.body.P_ERR_CODE === 'S') {

          $variables.pNavEncId =
            response.headers.get('X-Session-Id') ||
            response.headers.get('x-session-id') ||
            response.headers.get('X-session-id');
          $variables.pNavCode = 'EDIT';
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
          });
        }
      } else {

        let enc_p_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.pNavId },
        });

        let enc_p_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'PUT' },
        });

        $variables.getPmispddStatushseGetbytenderidVar.last_updated_by = $application.user.email;
        $variables.getPmispddStatushseGetbytenderidVar.last_updated_date = $application.functions.getSysdate();
        $variables.getPmispddStatushseGetbytenderidVar.last_updated_login = $application.user.email;

        // FIX: safely convert to number before incrementing
        const currentObjNum = Number($variables.obj_num_dummy) || 0;
        $variables.getPmispddStatushseGetbytenderidVar.object_version_num = currentObjNum + 1;

        console.log('[saveBtnAC] obj_num_dummy:', $variables.obj_num_dummy);
        console.log('[saveBtnAC] object_version_num being sent:', $variables.getPmispddStatushseGetbytenderidVar.object_version_num);

        let enc_p_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.getPmispddStatushseGetbytenderidVar },
        });

        const response2 = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddStatushseProcess',
          headers: {
            'x-session-code': enc_p_method,
            'x-session-id': enc_p_key,
          },
          body: {
            payload: enc_p_payload,
          },
        });

        if (response2.body.P_ERR_CODE === 'S') {
          // Update obj_num_dummy after successful save
          $variables.obj_num_dummy = $variables.getPmispddStatushseGetbytenderidVar.object_version_num;

          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            type: 'error',
            displayMode: 'persist',
          });
        }
      }
    }
  }

  return saveBtnAC;
});
