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

  class pddsetupactions extends ActionChain {

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
          const toPdd = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'assignmentadmin',
          });
          break;
        }
        case '2': {

          const toPdd2 = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'search',
          });
          break;
        }
        case '3': {
          const toPdd3 = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'completionadmin',
            params: {
              pTenderId: $application.variables.pTenderId,
            },
          });
          break;
        }
        case '4': {
          const toPdd3 = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'maintenance',
          });
          break;
        }
        case '5': {

          const toPdd5 = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'futureproject',
          });
          break;
        }
        case '6': {

          const toPdd6 = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'projectlist',
          });
          break;
        }
        case '7': {
          const toPdd4 = await Actions.navigateToFlow(context, {
            flow: 'pdd',
            target: 'parent',
            page: 'cashexpectation',
          });
          break;
        }
        default:
          break;
      }
    }
  }

  return pddsetupactions;
});
