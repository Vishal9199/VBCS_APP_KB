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

  class editAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let encryKey = await $application.functions.encryptJs($application.constants.secretKey, key);

      const toApprovalHierarchyPage = await Actions.navigateToPage(context, {
        page: 'program-page',
        params: {
          key: encryKey,
          method: 'PUT',
        },
      });
    }
  }

  return editAC;
});
