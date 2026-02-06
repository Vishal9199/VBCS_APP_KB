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

  class lookupValueAddEditAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.method 
     */
    async run(context, { method }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.isValueFormValid === "valid") {
        const headerCode = await $application.functions.encryptJs2($application.constants.secretKey, method);
        const headerId = await $application.functions.encryptJs2($application.constants.secretKey, $variables.lookupValueVar.lookup_value_id);

        if (method === "POST") {
          $variables.lookupValueVar.created_by = $application.user.fullName;
          $variables.lookupValueVar.created_date = await $application.functions.getSysdate();
          $variables.lookupValueVar.lookup_type_id = $variables.lookupTypeVar.lookup_type_id;
        }
        $variables.lookupValueVar.last_updated_by = $application.user.fullName;
        $variables.lookupValueVar.last_updated_date = await $application.functions.getSysdate();
        $variables.lookupValueVar.last_updated_login = $application.user.fullName;
        
        $variables.lookupValueVar.effective_start_date = await $application.functions.normalizeDate($variables.lookupValueVar.effective_start_date);
        $variables.lookupValueVar.effective_end_date = await $application.functions.normalizeDate($variables.lookupValueVar.effective_end_date);

        $variables.lookupValueVar.dependent_lookup_type_id = $variables.lookupTypeVar.dependent_lookup_type_id;
        $variables.encryptedBody.payload = await $application.functions.encryptJs2($application.constants.secretKey, $variables.lookupValueVar);


        const response = await Actions.callRest(context, {
          endpoint: 'AOL/postLookupValueProcess',
          headers: {
            'X-cache-code': headerCode,
            'X-cache-id': headerId,
          },
          body: $variables.encryptedBody,
        });

        if (response?.body?.P_ERR_CODE === "S") {

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

          return "S";
          
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'error',
          });
        }
        

      } else {
        // ❌ Form not valid — check single validation group
        const vg = document.getElementById("lookupValueForm");

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

      return "E";
    }
  }

  return lookupValueAddEditAC;
});