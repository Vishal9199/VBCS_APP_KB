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

  class searchAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      console.log("HELLO: ", $variables.pNavId);

      try {

        const progressMsgOpen = await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'open',
        });


        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyDtl2',
          headers: {
            'X-session-id': $variables.pNavId,
          },
        });

        if (response.body.count === 1) {
          $variables.postPayloadTypeVar = response.body.items[0];
          $variables.postPayloadTypeVar.last_updated_login = $application.user.email;


        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'REST API Error',
            message: 'Failed to load tender strategy details',
            displayMode: 'transient',
            type: 'error',
          });
        }

        const childResponse = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyChildDtl',
          headers: {
            'X-session-id': $variables.pNavId,
          },
        });

        if (childResponse.body.count === 1) {
          $variables.postPayloadTypeVar.tender_background = childResponse.body.items[0].tender_background;
          $variables.postPayloadTypeVar.tender_commercial_criteria = childResponse.body.items[0].tender_commercial_criteria;
          $variables.postPayloadTypeVar.tender_cost_estimate = childResponse.body.items[0].tender_cost_estimate;
          $variables.postPayloadTypeVar.tender_division_info = childResponse.body.items[0].tender_division_info;
          $variables.postPayloadTypeVar.tender_icv_minimum_info = childResponse.body.items[0].tender_icv_minimum_info;
          $variables.postPayloadTypeVar.tender_objective = childResponse.body.items[0].tender_objective;
          $variables.postPayloadTypeVar.tender_scope_work = childResponse.body.items[0].tender_scope_work;
          $variables.postPayloadTypeVar.tender_technical_criteria = childResponse.body.items[0].tender_technical_criteria;

          // ⭐ NEW: Store original CLOB values for change detection
          $variables.originalClobValues = {
            tender_background: childResponse.body.items[0].tender_background,
            tender_commercial_criteria: childResponse.body.items[0].tender_commercial_criteria,
            tender_cost_estimate: childResponse.body.items[0].tender_cost_estimate,
            tender_division_info: childResponse.body.items[0].tender_division_info,
            tender_icv_minimum_info: childResponse.body.items[0].tender_icv_minimum_info,
            tender_objective: childResponse.body.items[0].tender_objective,
            tender_scope_work: childResponse.body.items[0].tender_scope_work,
            tender_technical_criteria: childResponse.body.items[0].tender_technical_criteria
          };

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'REST API Error',
            message: 'Failed to load tender strategy CLOB details',
            displayMode: 'transient',
            type: 'error',
          });
        }

      } catch (error) {
        console.error("Load data error:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load data: ' + (error.message || 'Unknown error'),
          displayMode: 'transient',
          type: 'error',
        });
      } finally {
        const progressMsgOpen = await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
      }
    }
  }

  return searchAC;
});
