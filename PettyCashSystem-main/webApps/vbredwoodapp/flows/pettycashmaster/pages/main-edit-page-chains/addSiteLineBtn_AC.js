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

  class addSiteLineBtn_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/getPettycashSiteLineDtl',
      });

      $variables.siteLineADP.data = response.body.items;

      const addSiteLineOpen = await Actions.callComponentMethod(context, {
        selector: '#addSiteLine',
        method: 'open',
      });
    }
  }

  return addSiteLineBtn_AC;
});
