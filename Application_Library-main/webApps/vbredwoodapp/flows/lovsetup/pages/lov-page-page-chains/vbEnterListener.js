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

      if ($variables.op === 'PUT') {

        await Actions.callChain(context, {
          chain: 'loadHeaderAC',
        });
      }
      
    }
  }

  return vbEnterListener;
});
