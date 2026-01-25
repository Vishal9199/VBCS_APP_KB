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


      $application.variables.showNavigation = false;

      if ($variables.P_METHOD === 'PUT') {
        $variables.isRoleCodeReadOnly = true;
      }

      await Actions.callChain(context, {
        chain: 'headerOnLoadAC',
      });

      await Actions.callChain(context, {
        chain: 'childTableLoadAC',
      });

      await Actions.resetDirtyDataStatus(context, {
      });
    }
  }

  return vbEnterListener;
});
