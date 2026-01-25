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
      const formGroup = document.getElementById("userForm");

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
        selector: '#userDialog',
        method: 'getProperty',
        params: [
  'method',
],
      });


      if (method === 'POST') {

        $variables.childUser.object_version_num = 0;

        $variables.childUser.user_access_id = 0;

        // ✅ Extra condition for POST
        $variables.childUser.created_by = $application.user.email;
        $variables.childUser.created_date = await $application.functions.removeTimeStamp(sysdate);
      }

       $variables.childUser.effective_start_date = await $application.functions.removeTimeStamp($variables.childUser.effective_start_date);

      $variables.childUser.effective_end_date = $application.functions.removeTimeStamp($variables.childUser.effective_end_date);

      $variables.childUser.role_id = $variables.roleManagementVar.role_id;

      // Common logic for both POST and PUT
      $variables.childUser.last_updated_by = $application.user.email;
      $variables.childUser.last_updated_date = await $application.functions.removeTimeStamp(sysdate);
      $variables.childUser.last_updated_login = $application.user.email;

      // ✅ Encrypt values
      const headerCode = await $application.functions.encryptJs(
        $application.constants.secretKey,
        method
      );
      const headerID = await $application.functions.encryptJs($application.constants.secretKey, $variables.childUser.user_access_id);
      $variables.encryptPayload.payload = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.childUser
      );



      const response = await Actions.callRest(context, {
        endpoint: 'User/postAol_usrRoleUserAccessProcess',
        headers: {
          'X-cache-id': headerID,
          'X-cache-code': headerCode,
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

        $variables.P_METHOD = 'PUT';

        await Actions.callChain(context, {
          chain: 'childTableLoadAC',
        });

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });

        await Actions.fireDataProviderEvent(context, {
          refresh: null,
          target: $variables.getAolUsrRoleLovUserNameListSDP3,
        });

        return response.body.P_ERR_CODE;
      } else {

        await Actions.callChain(context, {
          chain: 'vbEnterListener',
        });
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'error',
        });

        await Actions.fireDataProviderEvent(context, {
          refresh: null,
          target: $variables.getAolUsrRoleLovUserNameListSDP3,
        });
      }

      await Actions.fireDataProviderEvent(context, {
        refresh: null,
        target: $variables.getAolUsrRoleLovUserNameListSDP3,
      });
    }
  }

  return editSaveAC;
});
