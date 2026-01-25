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

  class syncprocessAddEditAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.isFormValid === "valid") {
        // 🔐 Encrypt headers
        const headerCode = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.method
        );

        const headerId = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.key
        );

        if ($variables.method === "POST") {
          $variables.ScheduleSyncSearchVar.created_by = $application.user.fullName;
          $variables.ScheduleSyncSearchVar.created_date = await $application.functions.getSysdate();
        }
        $variables.ScheduleSyncSearchVar.last_updated_by = $application.user.fullName;
        $variables.ScheduleSyncSearchVar.last_update_date = await $application.functions.getSysdate();
        $variables.ScheduleSyncSearchVar.last_update_login = $application.user.fullName;

        $variables.ScheduleSyncSearchVar.creation_date = $page.functions.normalizeDate($variables.ScheduleSyncSearchVar.creation_date);
        $variables.ScheduleSyncSearchVar.last_updated_date = $page.functions.normalizeDate($variables.ScheduleSyncSearchVar.last_updated_date);
        $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.ScheduleSyncSearchVar);

        // 🌐 Call REST
        let response3 = await Actions.callRest(context, {
          endpoint: 'ScheduleProcess/postStgScheduleSyncProcess',
          headers: {
            'X-cache-code': headerCode,
            'X-cache-id': headerId,
          },
          body: $variables.encryptedBody,
        });

        if (response3.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            displayMode: 'transient',
            type: 'confirmation',
            summary: response3.body.P_ERR_MSG,
          });

          if ($variables.method === "PUT") {
            $variables.canEdit = false;
          } else if ($variables.method === "POST") {
            $variables.method = "PUT";
            $variables.key = response3.headers.get('x-cache-id');
          }
          await Actions.callChain(context, {
            chain: 'loadHeaderAC',
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response3.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'error',
          });
        }

        return response3.body.P_ERR_CODE;
      } else {
        const vg = document.getElementById("lookup-type-validation");

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
  }

  return syncprocessAddEditAC;
});
