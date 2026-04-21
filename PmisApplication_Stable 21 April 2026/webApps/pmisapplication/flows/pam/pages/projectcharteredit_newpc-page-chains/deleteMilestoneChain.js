// // ============================================================================
// // FILE 1: deleteMilestoneChain.js
// // Removes milestone row from local ADP (no API call).
// // ============================================================================
// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class deleteMilestoneChain extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {any} params.key       - milestone_id
//      * @param {any} params.current
//      * @param {any} params.event
//      * @param {any} params.originalEvent
//      * @param {number} params.index
//      */
//     async run(context, { event, originalEvent, key, current, index }) {
//       const { $variables } = context;

//       const currentData = $variables.ADPmilestone.data || [];
//       $variables.ADPmilestone.data = currentData.filter(
//         row => row.milestone_id !== key
//       );

//       console.log('🗑️ deleteMilestoneChain: removed milestone_id =', key);

//       await Actions.fireNotificationEvent(context, {
//         summary: 'Milestone deleted',
//         displayMode: 'transient',
//         type: 'confirmation',
//       });
//     }
//   }

//   return deleteMilestoneChain;
// });

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

  class deleteMilestoneChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key       - milestone_id
     * @param {any} params.current
     * @param {any} params.event
     * @param {any} params.originalEvent
     * @param {number} params.index
     */
    async run(context, { event, originalEvent, key, current, index }) {
      const { $variables } = context;

      try {
        // ── ENCRYPT KEY ───────────────────────────────────────────────────
        const enc_session_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: String(key) },
        });

        // ── ENCRYPT METHOD ────────────────────────────────────────────────
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'DELETE' },
        });

        // ── CALL ORDS ─────────────────────────────────────────────────────
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamProjectcharterMilestoneProcess',
          headers: {
            'x-session-id':   enc_session_id,
            'x-session-code': enc_method,
          },
          body: { payload: '' },
        });

        if (response.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Milestone deleted successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          // Refresh the milestone list
          await Actions.callChain(context, { chain: 'loadMilestones' });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Deletion failed',
            displayMode: 'transient',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('❌ deleteMilestoneChain error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + (error.message || 'Unexpected error'),
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return deleteMilestoneChain;
});