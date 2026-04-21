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

  class loadDependencies extends ActionChain {

    async run(context) {
      const { $variables } = context;

      try {
        if (!$variables.projectCharterVar.project_charter_id) {
          console.warn('⚠️ loadDependencies: No project charter ID available');
          return;
        }

        console.log('📋 Loading dependencies for charter ID:',
          $variables.projectCharterVar.project_charter_id);

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterDependencyGetbyprojectcharterid',
          uriParams: { p_project_charter_id: $variables.pNavId },
        });

        console.log('📥 Dependencies response:', response.body);

        if (response.body && Array.isArray(response.body.items)) {
          $variables.ADPdependency.data = response.body.items;
          console.log(
            '%cDependency Lines loaded',
            'color:#0ca678;font-weight:bold;',
            $variables.ADPdependency.data
          );
        } else {
          $variables.ADPdependency.data = [];
        }

      } catch (error) {
        $variables.ADPdependency.data = [];
        console.warn('No dependency lines found or error loading:', error);
      }
    }
  }

  return loadDependencies;
});