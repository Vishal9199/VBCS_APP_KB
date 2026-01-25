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
 
  class addLookupTypeAC extends ActionChain {
 
    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;
 
      const toLookupPage = await Actions.navigateToPage(context, {
        page: 'lookup-page',
        params: {
          key: '0',
        },
      });
    }
  }
 
  return addLookupTypeAC;
});