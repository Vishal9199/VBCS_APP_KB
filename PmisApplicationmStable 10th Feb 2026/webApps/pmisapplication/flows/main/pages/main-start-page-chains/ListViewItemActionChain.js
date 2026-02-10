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

  class ListViewItemActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.eventContext
     * @param {any} params.originalEvent
     */
    async run(context, { event, eventContext, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      switch (event.detail.context.key) {
        case '1': {

          const toPam = await Actions.navigateToFlow(context, {
            flow: 'pam',
            target: 'parent',
            page: 'projectlistsearch',
          });
          break;
        }
        case '2': {
        
          const toPam2 = await Actions.navigateToFlow(context, {
            flow: 'pam',
            target: 'parent',
            page: 'servicespecsearch',
          });
          break;
        }
        case '3': {
        
          const toPam3 = await Actions.navigateToFlow(context, {
            flow: 'pam',
            target: 'parent',
            page: 'projectchartesearch',
          });
          break;
        }
        case '4': {
        
          const toPam3 = await Actions.navigateToFlow(context, {
            flow: 'pam',
            target: 'parent',
            page: 'conceptsearch',
          });
          break;
        }
        case '5': {
        
          const toPam3 = await Actions.navigateToFlow(context, {
            flow: 'pam',
            target: 'parent',
            page: 'fypsearch',
          });
          break;
        }
        default:
          break;
      }
    }
  }

  return ListViewItemActionChain;
});
