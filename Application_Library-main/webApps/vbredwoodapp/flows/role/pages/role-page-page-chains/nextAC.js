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

  class previousAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
       $variables.childSearch.IN_OFFSET = +$variables.childSearch.IN_OFFSET + +$variables.childSearch.IN_LIMIT;

      await Actions.callChain(context, {
        chain: 'childTableLoadAC',
      });

     
    }
    }
  

  return previousAC;
});
