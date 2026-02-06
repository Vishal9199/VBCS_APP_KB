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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;


      if ($variables.pNavCode === 'EDIT') {
        await this.loadEditMode(context);
      } else {
        await this.loadCreateMode(context);
      }
    }

    /**
     * @param {Object} context
     */
    async loadEditMode(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
    

      $variables.editMode = 'edit';

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamFiveyearplandtlGetbyid',
        headers: {
          'x-session-id': $variables.pNavId,
        },
      });

      $variables.postFypHdrVar = response.body.items[0];

      await Actions.callChain(context, {
        chain: 'fypBudgetCostfetch',
      });
    }

    /**
     * @param {Object} context
     */
    async loadCreateMode(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
    

      $variables.editMode = 'add';
      $variables.postFypHdrVar.object_version_num = 0;
      $variables.postFypHdrVar.active_flag = 'Y';
      $variables.postFypHdrVar.created_by = $application.user.email;
      $variables.postFypHdrVar.created_date = $application.functions.getSysdate();
      $variables.postFypHdrVar.last_updated_by = $application.user.email;
      $variables.postFypHdrVar.last_updated_date = $application.functions.getSysdate();
      $variables.postFypHdrVar.last_updated_login = $application.user.email;
    }
  }

  return vbEnterListener;
});
