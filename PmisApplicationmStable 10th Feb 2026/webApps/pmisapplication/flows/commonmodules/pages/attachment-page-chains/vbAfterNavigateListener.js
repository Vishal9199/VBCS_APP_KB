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

  class vbAfterNavigateListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;


      await Actions.callChain(context, {
        chain: 'searchAC',
      });
    }
  }

  return vbAfterNavigateListener;
});