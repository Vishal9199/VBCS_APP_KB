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
        case '2':
          break;
        case '3':
          break;
        case '4':
          break;
        case '5':
          break;
        default:
          break;
      }
    }
  }

  return pddsetupactions;
});
