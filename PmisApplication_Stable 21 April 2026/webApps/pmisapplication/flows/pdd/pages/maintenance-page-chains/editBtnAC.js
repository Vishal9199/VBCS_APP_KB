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

  class editBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const encryptedkey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });

      const toMaintenanceaddedit = await Actions.navigateToPage(context, {
        page: 'maintenanceaddedit',
        params: {
          pNavCode: 'EDIT',
          pNavId: encryptedkey,
        },
      });
    }
  }

  return editBtnAC;
});
