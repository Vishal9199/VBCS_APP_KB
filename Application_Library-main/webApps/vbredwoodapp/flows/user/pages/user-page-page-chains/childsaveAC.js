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

  class editSaveAC extends ActionChain {
    /**
     * @param {Object} context
     */
    async run(context) {

      
      const { $page, $flow, $application, $constants, $variables } = context;
      const sysdate= await $application.functions.getSysdate;
      const formGroup = document.getElementById("dialog-form-group");

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

      const method = await Actions.callComponentMethod(context, {
        selector: '#userAccessDetailsDialog',
        method: 'getProperty',
        params: ['method'],
      });


      if (method === 'POST') {

        $variables.userAccessChildVar.object_version_num = 0;

        $variables.userAccessChildVar.user_id = $variables.userAccessDetailHeaderVar.user_id;

        $variables.userAccessChildVar.user_access_id = 0;

        // ✅ Extra condition for POST
        $variables.userAccessChildVar.created_by = $application.user.email;
        $variables.userAccessChildVar.created_date = await $application.functions.removeTimeStamp(sysdate);
      }

       $variables.userAccessChildVar.effective_start_date = await $application.functions.removeTimeStamp($variables.userAccessChildVar.effective_start_date);

      $variables.userAccessChildVar.effective_end_date = $application.functions.removeTimeStamp($variables.userAccessChildVar.effective_end_date);

      // Common logic for both POST and PUT
      $variables.userAccessChildVar.last_updated_by = $application.user.email;
      $variables.userAccessChildVar.last_updated_date = await $application.functions.removeTimeStamp(sysdate);
      $variables.userAccessChildVar.last_updated_login = $application.user.email;

      // ✅ Encrypt values
      const headerCode = await $application.functions.encryptJs(
        $application.constants.secretKey,
        method
      );
      const headerID = await $application.functions.encryptJs($application.constants.secretKey, $variables.userAccessChildVar.user_access_id);
      $variables.encryptPayload.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.userAccessChildVar);



      const response = await Actions.callRest(context, {
        endpoint: 'User/postAol_usrUserProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerID,
        },
        body: $variables.encryptPayload,
      });

      // ✅ Handle REST response
      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'confirmation',
          displayMode: 'transient',
        });

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });

        await Actions.fireDataProviderEvent(context, {
          target: $variables.getAolUsrRoleLovRolenameListSDP2,
          refresh: null,
        });

        return response.body.P_ERR_CODE;
      } else {

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });
        await Actions.fireDataProviderEvent(context, {
          target: $variables.getAolUsrRoleLovRolenameListSDP2,
          refresh: null,
        });

        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'error',
        });
      }
    }
  }

  return editSaveAC;
});
