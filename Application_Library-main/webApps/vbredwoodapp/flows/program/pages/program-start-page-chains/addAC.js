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

  class addAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let encryKey = await $application.functions.encryptJs($application.constants.secretKey, 0);

      const toApprovalHierarchyPage = await Actions.navigateToPage(context, {
        page: 'program-page',
        params: {
          key: encryKey,
        },
      });


    }
  }

  return addAC;
});
