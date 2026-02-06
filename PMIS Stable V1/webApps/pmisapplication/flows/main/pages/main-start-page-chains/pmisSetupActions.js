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

  class pmisSetupActions extends ActionChain {

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
          const toPmissetup = await Actions.navigateToFlow(context, {
            flow: 'pmissetup',
            target: 'parent',
            page: 'calendarsearch',
          });
          break;
        }
        case '2': {
          const toPmissetup = await Actions.navigateToFlow(context, {
            flow: 'pmissetup',
            target: 'parent',
            page: 'regionsearch',
          });
          break;
        }
        case '3': {
          const toPmissetup = await Actions.navigateToFlow(context, {
            flow: 'pmissetup',
            target: 'parent',
            page: 'lookupsearch',
          });
          break;
        }
        default:
          break;
      }
    }
  }

  return pmisSetupActions;
});
