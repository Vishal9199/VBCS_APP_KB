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

  class SimpleCreateAndEditPageTemplateSpSaveChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Validate the form before proceeding
      const formGroup = document.getElementById("fid_function_form_group");

      if (formGroup.valid !== "valid") {

        // Show messages on all invalid fields
        formGroup.showMessages();
        // Focus on the first invalid field
        formGroup.focusOn("@firstInvalidShown");

    
        // Warn user
        await Actions.fireNotificationEvent(context, {
          summary: "Please fix the highlighted errors before saving.",
          displayMode: "transient",
          type: "warning",
        });

        return; // 🚫 Stop execution if invalid
      }

      // ✅ Extra condition for POST
      if ($variables.method === 'POST') {
        $variables.functionDetailsVar.created_by = $application.user.email;
        $variables.functionDetailsVar.created_date = $application.functions.getSysdate();
      }

      // Common logic for both POST and PUT
      const headerCode = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.method
      );

      const headerID = await $application.functions.encryptJs(
        $flow.constants.secretKey,
        $variables.primaryKey
      );

      const encryptJs = await $application.functions.encryptJs(
        $flow.constants.secretKey,
        $variables.functionDetailsVar
      );

      $variables.encryptedPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Function/postFunctionProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerID,
        },
        body: $variables.encryptedPayload,
      });
       if (response.body.P_ERR_CODE === 'S') {

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'confirmation',
          displayMode: 'transient',
        });

        if ($variables.method === 'POST') {

          $variables.method = 'PUT';
          $variables.primaryKey = response.headers.get('x-cache-id');
        }

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });

        $variables.isFunctionCodeReadOnly = true;

        await Actions.resetDirtyDataStatus(context, {
        });
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'error',
        });
      }

      return response.body.P_ERR_CODE;
    }
  }

  return SimpleCreateAndEditPageTemplateSpSaveChain;
});
