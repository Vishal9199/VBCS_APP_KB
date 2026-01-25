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

  class onSaveBtn extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {boolean} params.feedbackEnabled
     */
    async run(context, { event, feedbackEnabled }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let response;

      if ($variables.mailSwitchVar === true) {
        $variables.postStgScheduleSetupSearchVar.mail_notification = 'Y';

      } else {
         $variables.postStgScheduleSetupSearchVar.mail_notification = 'N';
      }

      if ($variables.method === 'PUT') {

        if ($variables.isFormValid === "valid") {
          // 🔐 Encrypt headers
          const headerCode = await $application.functions.encryptJs($application.constants.secretKey, $variables.method);

          const headerId = await $application.functions.encryptJs($application.constants.secretKey, $variables.postStgScheduleSetupSearchVar.setup_id);


          await $application.functions.encryptJs($application.constants.secretKey, $variables.postStgScheduleSetupSearchVar);

          $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.postStgScheduleSetupSearchVar);

          // 🌐 Call REST
          const response2 = await Actions.callRest(context, {
            endpoint: 'SyncSetup/postStgScheduleSetupProcess',
            headers: {
              'X-cache-id': headerId,
              'X-cache-code': headerCode,
            },
            body: $variables.encryptedBody,
          });

          // ✅ / ❌ Notify
          if (response2.status === 200) {
            await Actions.fireNotificationEvent(context, {
              summary: 'Information Updated Successfully',
              displayMode: 'transient',
              type: 'confirmation',
            });

            await Actions.callChain(context, {
              chain: 'vbAfterNavigateListener',
            });

          } else {
            await Actions.fireNotificationEvent(context, {
              summary: 'Error',
              displayMode: 'transient',
              type: 'error',
            });
          }
        } else {
          // ❌ Form not valid — check single validation group
          const vg = document.getElementById("application-validation");

          if (vg) {
            if (vg.valid === "invalidHidden") {
              vg.showMessages(); // show hidden errors
            }
            if (vg.valid !== "valid") {
              vg.focusOn("@firstInvalidShown"); // focus first invalid field
            }
          }

          // Warn user
          await Actions.fireNotificationEvent(context, {
            summary: "Please fix the highlighted errors before saving.",
            displayMode: "transient",
            type: "warning",
          });
        }
      } else {
        if ($variables.isFormValid === "valid") {
          // 🔐 Encrypt headers
          const headerCode = await $application.functions.encryptJs($application.constants.secretKey, $variables.method);

          const headerId = await $application.functions.encryptJs($application.constants.secretKey, 0);


          const payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.postStgScheduleSetupSearchVar);

          // 🌐 Call REST
          const response2 = await Actions.callRest(context, {
            endpoint: 'SyncSetup/postStgScheduleSetupProcess',
            headers: {
              'X-cache-id': headerId,
              'X-cache-code': headerCode,
            },
            body: payload,
          });

          // ✅ / ❌ Notify
          if (response.body.P_ERR_CODE === "S") {
            await Actions.fireNotificationEvent(context, {
              summary: 'Information Updated Successfully',
              displayMode: 'transient',
              type: 'confirmation',
            });

            await Actions.callChain(context, {
              chain: 'vbAfterNavigateListener',
            });

          } else {
            await Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERR_MSG,
              displayMode: "transient",
              type: "error",
            });
          }
        } else {
          // ❌ Form not valid — check single validation group
          const vg = document.getElementById("application-validation");

          if (vg) {
            if (vg.valid === "invalidHidden") {
              vg.showMessages(); // show hidden errors
            }
            if (vg.valid !== "valid") {
              vg.focusOn("@firstInvalidShown"); // focus first invalid field
            }
          }

          // Warn user
          await Actions.fireNotificationEvent(context, {
            summary: "Please fix the highlighted errors before saving.",
            displayMode: "transient",
            type: "warning",
          });
        }

      }


      return response?.body?.P_ERR_CODE;
    }
  }

  return onSaveBtn;
});
