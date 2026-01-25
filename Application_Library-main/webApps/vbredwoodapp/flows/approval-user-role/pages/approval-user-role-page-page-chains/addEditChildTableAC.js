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

  class addEditChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.method
     */
    async run(context, { method }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      

      if ($variables.validationGroupVars.isChildTableFormValid === "valid") {
        const headerCode = await $application.functions.encryptJs($application.constants.secretKey, method);
        const headerId = await $application.functions.encryptJs($application.constants.secretKey, $variables.approvalRoleUserVar.approval_role_user_id);

        if (method === "POST") {
          $variables.approvalRoleUserVar.created_by = $application.user.fullName;
          $variables.approvalRoleUserVar.created_date = await $application.functions.getSysdate();
          $variables.approvalRoleUserVar.approval_role_id = $variables.approvalRoleVar.approval_role_id;
        }
        $variables.approvalRoleUserVar.last_updated_by = $application.user.fullName;
        $variables.approvalRoleUserVar.last_updated_date = await $application.functions.getSysdate();
        $variables.approvalRoleUserVar.last_updated_login = $application.user.fullName;

        $variables.approvalRoleUserVar.effective_start_date = await $application.functions.normalizeDate($variables.approvalRoleUserVar.effective_start_date);
        $variables.approvalRoleUserVar.effective_end_date = await $application.functions.normalizeDate($variables.approvalRoleUserVar.effective_end_date);

        $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.approvalRoleUserVar);


        const response = await Actions.callRest(context, {
          endpoint: 'ApprovalUserRole/postApproverRoleUserProcess',
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

  return addEditChildTableAC;
});
