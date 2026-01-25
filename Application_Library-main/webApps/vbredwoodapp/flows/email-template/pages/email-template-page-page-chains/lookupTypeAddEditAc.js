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

  class emailTemplateAddEditAc extends ActionChain {

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
          $variables.method
        );

        const headerId = await $application.functions.encryptJs(
          $application.constants.secretKey,
          $variables.key
        );

        // Set audit fields based on method
        if ($variables.method === "POST") {
          $variables.emailTemplateVar.created_by = $application.user.fullName;
          $variables.emailTemplateVar.created_date = await $application.functions.getSysdate();
        }
        $variables.emailTemplateVar.last_updated_by = $application.user.fullName;
        $variables.emailTemplateVar.last_updated_date = await $application.functions.getSysdate();
        $variables.emailTemplateVar.last_updated_login = $application.user.fullName;

        // Encrypt payload
        $variables.encryptedBody.payload = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          $variables.emailTemplateVar
        );

        // 🌐 Call REST
        response = await Actions.callRest(context, {
          endpoint: 'Application/postEmailProcess',
          body: $variables.encryptedBody,
          headers: {
            'x-session-code': headerCode,
            'x-session-id': headerId,
          },
        });

        // ✅ / ❌ Notify
        if (response.body.P_ERR_CODE === "S") {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: "transient",
            type: "confirmation",
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: "transient",
            type: "error",
          });
        }
      } else {
        // ❌ Form not valid — check validation group
        const vg = document.getElementById("email-template-validation");

        if (vg) {
          if (vg.valid === "invalidHidden") {
            vg.showMessages();
          }
          if (vg.valid !== "valid") {
            vg.focusOn("@firstInvalidShown");
          }
        }

        await Actions.fireNotificationEvent(context, {
          summary: "Please fix the highlighted errors before saving.",
          displayMode: "transient",
          type: "warning",
        });
      }

      return response?.body?.P_ERR_CODE;
    }
  }

  return emailTemplateAddEditAc;
});