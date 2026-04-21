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

  class navigateToGeneral_AC extends ActionChain {

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

      let enc_tender_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: current.row.tender_id,
        },
      });

      $application.variables.pTenderId = enc_tender_id;

      const toGeneral = await Actions.navigateToPage(context, {
        page: 'general',
        params: {
          // pTenderNum: enc_tender_number,
          pTenderId: enc_tender_id
        },
      });
    }
  }

  return navigateToGeneral_AC;
});
