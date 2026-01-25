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

  class headerEditSaveAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ✅ Validate the form before proceeding
      const formGroup = document.getElementById("fid_menu_form_group");

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
    
      if ($variables.method === 'POST') {


        const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
        });

        $variables.menuVar.object_version_num = 0;

        // ✅ Extra condition for POST
          $variables.menuVar.created_by = $application.user.email;

        $variables.menuVar.created_date = $application.functions.getSysdate();

        $variables.menuVar.last_updated_by = $application.user.email;

        $variables.menuVar.last_updated_date = $application.functions.getSysdate();

        $variables.menuVar.last_updated_login = $application.user.email;
      }

      // Common logic for both POST and PUT
      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
        });

      const headerCode = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.method
      );

      const headerID = await $application.functions.encryptJs($application.constants.secretKey, $variables.primaryKey);

      const encryptJs = await $application.functions.encryptJs($application.constants.secretKey, $variables.menuVar);

      $variables.encryptedPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Menu/postMenuProcess',
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

        if ($variables.method === "PUT") {
            $variables.isMenuCodeReadOnly = true;
          } else if ($variables.method === "POST") {
            $variables.method = "PUT";
            $variables.primaryKey = response.headers.get('x-cache-id');
          }

        await Actions.callChain(context, {
          chain: 'headerOnload',
        });

        return response.body.P_ERR_CODE;
     
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'error',
        });
      }

      return response.body.P_ERR_CODE;
      }
    
  }

  return headerEditSaveAC;
});
