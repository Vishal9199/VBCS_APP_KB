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

  class onCreateAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      const toRegionedit = await Actions.navigateToPage(context, {
        page: 'regionedit',
        params: {
          pNavCode: 'CREATE',
          pNavId: '0',
        },
      });
    }
  }

  return onCreateAction;
});