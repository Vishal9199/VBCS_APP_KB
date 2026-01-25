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

  class headerAddEditAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let response;
      let header = $variables.approvalHierarchyVar;

      if ($variables.validationGroupVars.isHeaderFormValid === "valid") {
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
          header.created_by = $application.user.fullName;
          header.created_date = await $application.functions.getSysdate();
        }
        header.last_updated_by = $application.user.fullName;
        header.last_updated_date = await $application.functions.getSysdate();
        header.last_updated_login = $application.user.fullName;

        $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, header);

        // 🌐 Call REST
        response = await Actions.callRest(context, {
          endpoint: 'approvalHeirarchy/postApprovalHierarchyProcess',
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

          if ($variables.method === "PUT") {
            $variables.canEdit = false;
          } else if ($variables.method === "POST") {
            $variables.method = "PUT";
            $variables.key = response.headers.get('x-cache-id');
          }
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
        const vg = document.getElementById($variables.validationGroupVars.headerFormId);

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

  return headerAddEditAC;
});
