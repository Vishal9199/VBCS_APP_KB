define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class SynADPFutureProjectsAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // encryptAC expects a string — must JSON.stringify the object first
        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: JSON.stringify($variables.searchObj),
          },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postSearchFutureProjects',
          body: { payload: encryptedPayload },
        });

        if (!response.ok) {
          console.error('SynADPFutureProjectsAC: REST call failed ==> ' + response.status);
          $variables.futureProjectADP.data = [];
          $variables.OUT_TOTAL_COUNT = 0;
          $variables.OUT_HAS_NEXT    = 'N';
          await $page.variables.futureProjectBDP.instance.resetAllUnsubmittedItems();
          return;
        }

        const body = response.body;

        if (body && body.P_OUTPUT && body.P_OUTPUT.length > 0) {
          $variables.futureProjectADP.data = body.P_OUTPUT;
        } else {
          $variables.futureProjectADP.data = [];
        }

        $variables.OUT_TOTAL_COUNT = body.OUT_TOTAL_COUNT || 0;
        $variables.OUT_HAS_NEXT    = body.OUT_HAS_NEXT    || 'N';

        await $page.variables.futureProjectBDP.instance.resetAllUnsubmittedItems();

      } catch (error) {
        console.error('SynADPFutureProjectsAC error ==> ' + error);
        $variables.futureProjectADP.data = [];
        await $page.variables.futureProjectBDP.instance.resetAllUnsubmittedItems();
      }
    }
  }

  return SynADPFutureProjectsAC;
});