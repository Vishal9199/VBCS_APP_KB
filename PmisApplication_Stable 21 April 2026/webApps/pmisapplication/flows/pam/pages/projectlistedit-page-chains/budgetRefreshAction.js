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

  class budgetRefreshAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // Refresh the budget cost lines ADP
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPbudgetCostLines,
          refresh: null,
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Refreshed',
          message: 'Budget table refreshed',
          displayMode: 'transient',
          type: 'info',
        });

        let enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.masterPlanHeaderVar.project_id,
          },
        });

        // TODO: Call REST endpoint to reload from database
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamMasterplanLinebudgetcostGetbyid',
          headers: {
            // 'x-session-id': $variables.masterPlanHeaderVar.project_id,
            'x-session-id': enc_key,
          },
        });

        $variables.ADPbudgetCostLines.data = response.body.items;

      } catch (error) {
        console.error('Error refreshing budget table:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to refresh budget table',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return budgetRefreshAction;
});