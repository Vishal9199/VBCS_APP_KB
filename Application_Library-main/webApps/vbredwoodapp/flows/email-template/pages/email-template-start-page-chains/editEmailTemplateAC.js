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
 
      const toEmailTemplatePage = await Actions.navigateToPage(context, {
        page: 'email-template-page',
        params: {
          method: 'PUT',
          key: key
        },
      });
    }
  }
 
  return HyperlinkClickChain;
});
 
 