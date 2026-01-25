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

  class configureBody extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.op === "POST") {

        $variables.applicationManagementVar.created_by = "yoyoy";
        $variables.applicationManagementVar.created_date = await $application.functions.getSysdate();

        $variables.applicationManagementVar.last_updated_by = "SGDJAD";
        $variables.applicationManagementVar.last_updated_date = await $application.functions.getSysdate();
      } else {
        $variables.applicationManagementVar.last_updated_by = $application.user.fullName;
        $variables.applicationManagementVar.last_updated_date = await $application.functions.getSysdate();
      }

      $variables.applicationManagementVar.last_updated_login = "yoyoyo";
    }
  }

  return configureBody;
});
