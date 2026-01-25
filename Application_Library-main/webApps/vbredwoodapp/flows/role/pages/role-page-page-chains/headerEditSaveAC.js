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
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const sysdate = await $application.functions.getSysdate();

      // ✅ Validate the form before proceeding
      const formGroup = document.getElementById("fid_role_form_group");

      if (formGroup.valid !== "valid") {
        formGroup.showMessages();
        formGroup.focusOn("@firstInvalidShown");

        await Actions.fireNotificationEvent(context, {
          summary: "Please fix the highlighted errors before saving.",
          displayMode: "transient",
          type: "warning",
        });

        return; // 🚫 Stop execution if invalid
      }
    
      if ($variables.P_METHOD === 'POST') {

        $variables.roleManagementVar.object_version_num = 0;

        $variables.roleManagementVar.created_by = $application.user.email;


        $variables.roleManagementVar.created_date = await $application.functions.removeTimeStamp(sysdate);

        $variables.roleManagementVar.last_updated_by = $application.user.email;
        $variables.roleManagementVar.last_updated_date = await $application.functions.removeTimeStamp(sysdate);

        $variables.roleManagementVar.last_updated_login = $application.user.email;

      } else if ($variables.P_METHOD === 'PUT') {

  
          $variables.roleManagementVar.created_date = await $application.functions.removeTimeStamp(
            $variables.roleManagementVar.created_date
          );
          console.log($variables.roleManagementVar.created_date);

       
          $variables.roleManagementVar.last_updated_date = await $application.functions.removeTimeStamp(
            $variables.roleManagementVar.last_updated_date
          );
        

        $variables.roleManagementVar.last_updated_by = $application.user.email;
        $variables.roleManagementVar.last_updated_login = $application.user.email;
      }

      // Common logic for both POST and PUT
      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {});

      const headerCode = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.P_METHOD
      );

      const headerID = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.P_PRIMARY_KEY
      );

      const encryptJs = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.roleManagementVar
      );

      $variables.encryptPayload.payload = encryptJs;

      const response = await Actions.callRest(context, {
        endpoint: 'Role/postAol_usrRoleProcess',
        headers: {
          'X-cache-code': headerCode,
          'X-cache-id': headerID,
        },
        body: $variables.encryptPayload,
      });

      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'confirmation',
          displayMode: 'transient',
        });

        if ($variables.P_METHOD === "PUT") {
          $variables.isRoleCodeReadOnly = true;
        } else if ($variables.P_METHOD === "POST") {
          $variables.P_METHOD = "PUT";
          $variables.P_PRIMARY_KEY = response.headers.get('x-cache-id');
        }

        await Actions.callChain(context, {
          chain: 'headerOnLoadAC',
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
