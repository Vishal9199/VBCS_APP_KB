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
      const formGroup = document.getElementById("fid_sub_menu_entries_form");

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
        selector: '#fid_menuEntriesDialog',
        method: 'getProperty',
        params: [
          'method'
        ],
      });


      if (method === 'POST') {

        $variables.subMenuVar.menu_entry_id = 0;

        // ✅ Extra condition for POST
        $variables.subMenuVar.created_by = $application.user.email;
        $variables.subMenuVar.created_date = $application.functions.getSysdate();
      }

      $variables.subMenuVar.menu_id = $variables.menuVar.menu_id;

      // Common logic for both POST and PUT
      $variables.subMenuVar.last_updated_by = $application.user.email;
      $variables.subMenuVar.last_updated_date = $application.functions.getSysdate();
      $variables.subMenuVar.last_updated_login = $application.user.email;

      // ✅ Encrypt values
      const headerCode = await $application.functions.encryptJs(
        $application.constants.secretKey,
        method
      );
      const headerID = await $application.functions.encryptJs($application.constants.secretKey, $variables.subMenuVar.menu_entry_id);
      $variables.encryptedPayload.payload = await $application.functions.encryptJs(
        $application.constants.secretKey,
        $variables.subMenuVar
      );



      const response = await Actions.callRest(context, {
        endpoint: 'Menu/postMenuEntriesProcess',
        headers: {
          'X-cache-id': headerID,
          'X-cache-code': headerCode,
        },
        body: $variables.encryptedPayload,
      });

      await Actions.fireDataProviderEvent(context, {
        target: $variables.getMenuLovFunctionName2ListSDP4,
        refresh: null,
      });

      // ✅ Handle REST response
      if (response.body.P_ERR_CODE === 'S') {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'confirmation',
          displayMode: 'transient',
        });

        $variables.method = 'PUT';

        await Actions.callChain(context, {
          chain: 'childTableOnLoadAC',
        });

        return response.body.P_ERR_CODE;
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          type: 'error',
        });
      }
    }
  }

  return editSaveAC;
});
