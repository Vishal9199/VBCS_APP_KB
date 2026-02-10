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

  class secondaryActionListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     * @param {string} params.actionId
     * @param {string} params.secondaryItem
     */
    async run(context, { event, actionId, secondaryItem }) {
      const { $variables } = context;

      try {
        console.log('Secondary Action triggered:', actionId);

        switch (actionId) {
          case 'save':
            console.log('Executing Save...');
            await Actions.callChain(context, {
              chain: 'saveRegionData',
              params: {
                closeAfterSave: false
              }
            });
            break;

          case 'saveClose':
            console.log('Executing Save & Close...');
            await Actions.callChain(context, {
              chain: 'saveRegionData',
              params: {
                closeAfterSave: true
              }
            });
            break;

          case 'about':
            console.log('Opening About dialog...');
            if ($variables.regionHeaderVar && $variables.regionHeaderVar.region_id) {
              document.getElementById('aboutDialog').open();
            } else {
              await Actions.fireNotificationEvent(context, {
                summary: 'Information',
                message: 'About information is available only for saved records',
                type: 'info',
                displayMode: 'transient'
              });
            }
            break;

          default:
            console.warn('Unknown action ID:', actionId);
        }

      } catch (error) {
        console.error('secondaryActionListener error:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Action failed: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return secondaryActionListener;
});