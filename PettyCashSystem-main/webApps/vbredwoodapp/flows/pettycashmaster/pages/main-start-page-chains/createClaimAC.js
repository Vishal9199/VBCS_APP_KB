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

  class createClaimAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const governorateDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#governorateDialog',
        method: 'open',
      });

      // const toMainEdit = await Actions.navigateToPage(context, {
      //   page: 'main-edit',
      //   params: {
      //     'p_nav_id': '0',
      //   },
      // });
    }
  }

  return createClaimAC;
});
