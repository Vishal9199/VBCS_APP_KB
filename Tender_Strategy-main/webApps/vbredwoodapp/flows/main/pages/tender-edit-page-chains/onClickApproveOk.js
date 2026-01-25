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

//   class onClickApproveOk extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {object} params.event
//      * @param {any} params.originalEvent
//      */
//     async run(context, { event, originalEvent }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       try {
//         await Actions.callComponentMethod(context, {
//           selector: '#progressMsg',
//           method: 'open',
//         });

//         $flow.variables.updateActionObj.P_COMMENTS =
//           $flow.variables.responseComments || '-';

          

//         const approveTaskObj = {
//           outcome: "APPROVE",
//           comment: $flow.variables.responseComments
//         };

//         const response = await Actions.callRest(context, {
//           endpoint: 'ProcessApi/Approve_Reject',
//           uriParams: {
//             taskId: $variables.taskId,
//           },
//           body: approveTaskObj
//         });

//         if (!response?.ok) {
//           throw new Error('Approval REST call failed');
//         }

//         await Actions.fireNotificationEvent(context, {
//           summary: 'Approved Successfully',
//           type: 'confirmation',
//           displayMode: 'transient',
//         });

//         await Actions.navigateBack(context, {
//         });

//       } catch (error) {
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Error in Approval Process. Please contact administrator.',
//         });
//       } finally {
//         await Actions.callComponentMethod(context, {
//           selector: '#progressMsg',
//           method: 'close',
//         });

//         await Actions.callComponentMethod(context, {
//           selector: '#approveDialog',
//           method: 'refresh',
//         });

//         await Actions.callComponentMethod(context, {
//           selector: '#approveDialog',
//           method: 'close',
//         });
//       }
//     }
//   }

//   return onClickApproveOk;
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

  class onClickApproveOk extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'open',
        });

        $flow.variables.updateActionObj.p_comments = $flow.variables.responseComments || '-';

        const approveTaskObj = {
          outcome: "APPROVE",
          comment: $flow.variables.responseComments
        };

        const response = await Actions.callRest(context, {
          endpoint: 'ProcessApi/Approve_Reject',
          uriParams: {
            taskId: $variables.taskId,
          },
          body: approveTaskObj
        });

        if (!response?.ok) {
          throw new Error('Approval REST call failed');
        }

        await Actions.fireNotificationEvent(context, {
          summary: 'Approved Successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        await Actions.callComponentMethod(context, {
          selector: '#approveDialog',
          method: 'close',
        });

        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });

        // await Actions.navigateBack(context, {
        // });

      } catch (error) {

        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
        await Actions.fireNotificationEvent(context, {
          summary: 'Error in Approval Process. Please contact administrator.',
        });
      } finally {
      }
    }
  }

  return onClickApproveOk;
});