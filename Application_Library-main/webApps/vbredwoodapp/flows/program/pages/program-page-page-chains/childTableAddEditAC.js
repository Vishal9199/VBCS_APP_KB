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

  class childTableAddEditAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.method
     */
    // Custom Validation Action Chain
    // Simplified Action Chain - Direct Custom Messages Only
    async run(context, { method }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.validationGroupVars.isChildTableFormValid === "valid") {
        const headerCode = await $application.functions.encryptJs($application.constants.secretKey, method);
        const headerId = await $application.functions.encryptJs($application.constants.secretKey, $variables.parameterVar.parameter_id);

        const fieldType = $variables.parameterVar.field_type;

        // ---- LOV / DEPENDENT LOV ----
        if (fieldType !== 'LOV' && fieldType !== 'DEPENDENT_LOV') {
          $variables.parameterVar.lov_code = null;
        }

        if (fieldType !== 'DEPENDENT_LOV') {
          $variables.parameterVar.parent_parameter_code = null;
        }

        // ---- NUMBER ----
        if (fieldType !== 'NUMBER') {
          $variables.parameterVar.min_value = null;
          $variables.parameterVar.max_value = null;
        }

        // ---- TEXT TYPES ----
        if (fieldType !== 'TEXTAREA' && fieldType !== 'STRING') {
          $variables.parameterVar.min_length = null;
          $variables.parameterVar.max_length = null;
        }


        if (method === "POST") {
          $variables.parameterVar.created_by = $application.user.fullName;
          $variables.parameterVar.created_date = await $application.functions.getSysdate();
          $variables.parameterVar.program_id = $variables.programVar.program_id;
        }
        $variables.parameterVar.last_updated_by = $application.user.fullName;
        $variables.parameterVar.last_updated_date = await $application.functions.getSysdate();
        $variables.parameterVar.last_updated_login = $application.user.fullName;

        $variables.parameterVar.effective_start_date = await $application.functions.normalizeDate($variables.parameterVar.effective_start_date);
        $variables.parameterVar.effective_end_date = await $application.functions.normalizeDate($variables.parameterVar.effective_end_date);

        $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.parameterVar);

        const response = await Actions.callRest(context, {
          endpoint: 'Program/postProgramParamProcess',
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
        const vg = document.getElementById($variables.validationGroupVars.childTableFormId);

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

  return childTableAddEditAC;
});
