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

  class lookupTypeAddEditAc extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let response;

      if ($variables.isFormValid === "valid") {
        // 🔐 Encrypt headers
        const headerCode = await $application.functions.encryptJs2(
          $application.constants.secretKey,
          $variables.method
        );

        const headerId = await $application.functions.encryptJs2(
          $application.constants.secretKey,
          $variables.key
        );

        if ($variables.method === "POST") {
          $variables.lookupTypeVar.created_by = $application.user.fullName;
          $variables.lookupTypeVar.created_date = await $application.functions.getSysdate();
        }
        $variables.lookupTypeVar.last_updated_by = $application.user.fullName;
        $variables.lookupTypeVar.last_updated_date = await $application.functions.getSysdate();
        $variables.lookupTypeVar.last_updated_login = $application.user.fullName;

        $variables.lookupTypeVar.effective_start_date = $page.functions.normalizeDate($variables.lookupTypeVar.effective_start_date);
        $variables.lookupTypeVar.effective_end_date = $page.functions.normalizeDate($variables.lookupTypeVar.effective_end_date);
        $variables.lookupValueVar.dependent_lookup_type_id = $variables.lookupTypeVar.dependent_lookup_type_id;
        $variables.encryptedBody.payload = await $application.functions.encryptJs2($application.constants.secretKey, $variables.lookupTypeVar);

        // 🌐 Call REST
        response = await Actions.callRest(context, {
          endpoint: 'AOL/postLookupTypeProcess',
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

      return response?.body?.P_ERR_CODE;
    }
  }

  return lookupTypeAddEditAc;
});
