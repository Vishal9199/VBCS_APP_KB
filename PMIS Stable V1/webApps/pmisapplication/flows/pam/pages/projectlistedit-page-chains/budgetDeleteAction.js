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

  class budgetDeleteAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.current 
     */
    async run(context, { current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('Deleting budget line:', current.data);

        // Remove from ADPbudgetCostLines
        await Actions.fireDataProviderEvent(context, {
          target: $variables.ADPbudgetCostLines,
          remove: {
            keys: [current.data.budget_cost_id],
          },
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Deleted',
          message: 'Budget allocation deleted successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });

        // TODO: Call REST endpoint to delete from database
        // const response = await Actions.callRest(context, {
        //   endpoint: 'PAM/deleteBudgetCostLine',
        //   uriParams: {
        //     p_budget_cost_id: current.data.budget_cost_id,
        //   },
        // });

      } catch (error) {
        console.error('Error deleting budget line:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to delete budget allocation',
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return budgetDeleteAction;
});