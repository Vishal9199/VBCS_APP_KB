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

  class AdvancedCreateAndEditPageTemplateSpPrimaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toSearch = await Actions.navigateToPage(context, {
        page: 'search',
      });

      await Actions.resetVariables(context, {
        variables: [
    '$application.variables.menuSelection',
  ],
      });
    }
  }

  return AdvancedCreateAndEditPageTemplateSpPrimaryActionChain;
});
