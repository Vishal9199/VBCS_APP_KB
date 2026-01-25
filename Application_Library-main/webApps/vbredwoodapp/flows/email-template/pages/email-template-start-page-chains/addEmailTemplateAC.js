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

  class addEmailTemplateAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toEmailTemplatePage = await Actions.navigateToPage(context, {
        page: 'email-template-page',
        params: {
          key: 0,
          method: 'POST',
        },
      });
    }
  }

  return addEmailTemplateAC;
});
