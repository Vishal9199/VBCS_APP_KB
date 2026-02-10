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

  class exportChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $variables } = context;

      try {
        // Validate that project charter exists
        if (!$variables.projectCharterVar.project_charter_id) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Please save the project charter before exporting',
            type: 'warning',
            displayMode: 'transient',
          });
          return;
        }

        // Call REST API to export
        const response = await Actions.callRest(context, {
          endpoint: 'yourServiceName/exportProjectCharter',
          uriParams: {
            projectCharterId: $variables.projectCharterVar.project_charter_id,
          },
        });

        if (response.ok) {
          // Download the exported file
          const blob = await response.body;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ProjectCharter_' + $variables.projectCharterVar.ref_num + '.pdf';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          await Actions.fireNotificationEvent(context, {
            summary: 'Success',
            message: 'Project Charter exported successfully',
            type: 'confirmation',
            displayMode: 'transient',
          });

        } else {
          throw new Error('Failed to export project charter');
        }

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to export: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      }
    }
  }

  return exportChain;
});