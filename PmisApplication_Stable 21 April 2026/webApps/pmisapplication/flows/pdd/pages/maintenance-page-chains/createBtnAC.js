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

  class createBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const toMaintenanceaddedit = await Actions.navigateToPage(context, {
        page: 'maintenanceaddedit',
        params: {
          pNavCode: 'CREATE',
          pNavId: '0',
        },
      });
    }
  }

  return createBtnAC;
});
