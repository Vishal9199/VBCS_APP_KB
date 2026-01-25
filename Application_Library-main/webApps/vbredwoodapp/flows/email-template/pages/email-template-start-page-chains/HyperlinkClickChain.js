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

  class HyperlinkClickChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {number} params.index 
     * @param {any} params.current 
     */
    async run(context, { key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toLookupPage = await Actions.navigateToPage(context, {
        page: 'lookup-page',
        params: {
          key: key,
          method: 'PUT',
          lookupTypeVar: current.row,
        },
      });
    }
  }

  return HyperlinkClickChain;
});
