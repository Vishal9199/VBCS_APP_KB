define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class riskSecondaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.actionId
     * @param {any} params.secondaryItem
     * @param {any} params.event
     */
    async run(context, { actionId, secondaryItem, event }) {
      const { $variables } = context;

      if (actionId === 'about') {
        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Risk Management — Project Risk Register. Manage risk identification, analysis and response for this tender.',
        //   displayMode: 'persist',
        //   type: 'info',
        // });

        $variables.about.created_by = $variables.ADPrisk.data[0].created_by;
        $variables.about.created_date = $variables.ADPrisk.data[0].created_date;
        $variables.about.last_updated_by = $variables.ADPrisk.data[0].last_updated_by;
        $variables.about.last_updated_date = $variables.ADPrisk.data[0].last_updated_date;
        $variables.about.last_updated_login = $variables.ADPrisk.data[0].last_updated_login;

        const aboutDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#aboutDialog',
          method: 'open',
        });

      } else if (actionId === 'saveClose') {
        await Actions.callChain(context, {
          chain: 'onSaveRisk',
        });

        // await Actions.navigateBack(context, {
        // });

      }
    }
  }

  return riskSecondaryActionChain;
});