define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onClosePrimary_AC extends ActionChain {

    async run(context) {
      const { $application } = context;


      await Actions.resetVariables(context, {
        variables: [
    '$application.variables.menuSelection',
  ],
      });

      const toSearch = await Actions.navigateToPage(context, {
        page: 'search',
      });
    }
  }

  return onClosePrimary_AC;
});