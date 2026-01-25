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

  class addEditAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let response;

      if ($variables.isFormValid === "valid") {
        // 🔐 Encrypt headers
        const headerCode = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.op
        );

        const headerId = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.key
        );

        if ($variables.op === "POST") {
          $variables.applicationManagementVar.created_by = $application.user.fullName;
          $variables.applicationManagementVar.created_date = await $application.functions.getSysdate();
        }
        $variables.applicationManagementVar.last_updated_by = $application.user.fullName;
        $variables.applicationManagementVar.last_updated_date = await $application.functions.getSysdate();
        $variables.applicationManagementVar.last_updated_login = $application.user.fullName;


        $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.applicationManagementVar);

        // 🌐 Call REST
        response = await Actions.callRest(context, {
          endpoint: 'Application/postApplicationProcess',
          headers: {
            'X-cache-code': headerCode,
            'X-cache-id': headerId,
          },
          body: $variables.encryptedBody,
        });

        // ✅ / ❌ Notify
        if (response.body.P_ERR_CODE === "S") {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: "transient",
            type: "confirmation",
          });

          if ($variables.op === "POST") {
            $variables.op = "PUT";
            $variables.key = response.headers.get('x-cache-id');
          }
          $variables.canEdit = false;

          await Actions.callChain(context, {
            chain: 'loadHeaderAC',
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

      return response?.body?.P_ERR_CODE;
    }
  }

  return addEditAC;
});
