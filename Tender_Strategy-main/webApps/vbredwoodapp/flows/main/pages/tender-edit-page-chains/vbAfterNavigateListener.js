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

//   class vbAfterNavigateListener extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
//      */
//     async run(context, { event }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       try {

//         const response = await Actions.callRest(context, {
//           endpoint: 'ORDS/getTenderStrategyDtl2',
//           headers: {
//             'X-session-id': $variables.pNavId,
//           },
//         });

//         if (response.body.count === 1) {

//           $variables.postPayloadTypeVar.comments = response.body.items[0].comments;
//           $variables.postPayloadTypeVar.strategy_hdr_id = response.body.items[0].strategy_hdr_id;
//           $variables.postPayloadTypeVar.contract_holder_id = response.body.items[0].contract_holder_id;
//           $variables.postPayloadTypeVar.contract_owner_id = response.body.items[0].contract_owner_id;
//           $variables.postPayloadTypeVar.currency = response.body.items[0].currency;
//           $variables.postPayloadTypeVar.person_id = response.body.items[0].person_id;
//           $variables.postPayloadTypeVar.pr_estimated_value = response.body.items[0].pr_estimated_value;
//           $variables.postPayloadTypeVar.pr_number = response.body.items[0].pr_number;
//           $variables.postPayloadTypeVar.pr_title = response.body.items[0].pr_title;
//           $variables.postPayloadTypeVar.procurement_plan = response.body.items[0].procurement_plan;
//           $variables.postPayloadTypeVar.request_date = response.body.items[0].request_date;
//           $variables.postPayloadTypeVar.request_number = response.body.items[0].request_number;
//           $variables.postPayloadTypeVar.scm_team = response.body.items[0].scm_team;
//           $variables.postPayloadTypeVar.status_id = response.body.items[0].status_id;
//           $variables.postPayloadTypeVar.tender_category = response.body.items[0].tender_category;
//           $variables.postPayloadTypeVar.tender_category_des = response.body.items[0].tender_category_des;
//           $variables.postPayloadTypeVar.tender_committe = response.body.items[0].tender_committe;
//           $variables.postPayloadTypeVar.tender_type = response.body.items[0].tender_type;
//           $variables.postPayloadTypeVar.created_by = response.body.items[0].created_by;
//           $variables.postPayloadTypeVar.created_date = response.body.items[0].created_date;
//           $variables.postPayloadTypeVar.last_updated_by = response.body.items[0].last_updated_by;
//           $variables.postPayloadTypeVar.last_updated_date = response.body.items[0].last_updated_date;
//           $variables.postPayloadTypeVar.last_updated_login = $application.user.email;
//           $variables.postPayloadTypeVar.object_version_num = response.body.items[0].object_version_num + 1;

//           await Actions.callChain(context, {
//             chain: 'toolBarAC',
//             params: {
//               statusCode: response.body.items[0].status_code,
//             },
//           });
//         } else {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'REST API Error',
//             displayMode: 'transient',
//             type: 'error',
//           });
//         }

//         const response3 = await Actions.callRest(context, {
//           endpoint: 'ORDS/getTenderStrategyChildDtl',
//           headers: {
//             'X-session-id': $variables.pNavId,
//           },
//         });

//         if (response3.body.count === 1) {
//           $variables.postPayloadTypeVar.tender_background = response3.body.items[0].tender_background;
//           $variables.postPayloadTypeVar.tender_commercial_criteria = response3.body.items[0].tender_commercial_criteria;
//           $variables.postPayloadTypeVar.tender_cost_estimate = response3.body.items[0].tender_cost_estimate;
//           $variables.postPayloadTypeVar.tender_division_info = response3.body.items[0].tender_division_info;
//           $variables.postPayloadTypeVar.tender_icv_minimum_info = response3.body.items[0].tender_icv_minimum_info;
//           $variables.postPayloadTypeVar.tender_objective = response3.body.items[0].tender_objective;
//           $variables.postPayloadTypeVar.tender_scope_work = response3.body.items[0].tender_scope_work;
//           $variables.postPayloadTypeVar.tender_technical_criteria = response3.body.items[0].tender_technical_criteria;
//         } else {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'REST API Error',
//             displayMode: 'transient',
//             type: 'error',
//           });
//         }

//       } catch (error) {
//       } finally {
//       }
//     }
//   }

//   return vbAfterNavigateListener;
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

  class vbAfterNavigateListener extends ActionChain {

    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.callChain(context, {
        chain: 'searchAC',
      });

      await Actions.callChain(context, {
        chain: 'toolBarAC',
        params: {
          statusCode: $variables.postPayloadTypeVar.status_code,
          taskId: $variables.taskId,
        },
      });

    }
  }

  return vbAfterNavigateListener;
});