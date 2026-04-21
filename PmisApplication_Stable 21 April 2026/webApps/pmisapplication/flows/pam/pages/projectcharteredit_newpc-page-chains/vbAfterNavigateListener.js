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

//     async run(context, { event }) {
//       const { $page, $variables } = context;

//       // Open progress dialog
//       await Actions.callComponentMethod(context, {
//         selector: '#progressMsg',
//         method: 'open',
//       });

//       try {
//         if ($variables.pNavCode === "EDIT") {
//           // ========== EDIT MODE ==========
//           await this.loadEditMode(context);

//           await Actions.callChain(context, {
//             chain: 'toolBarAC',
//             params: {
//               statusCode: $variables.projectCharterVar.status_code,
//             },
//           });
//         } else {
//           // ========== CREATE MODE ==========
//           await this.loadCreateMode(context);

//           await Actions.callChain(context, {
//             chain: 'toolBarAC',
//             params: {
//               statusCode: 'DRA',
//             },
//           });
//         }
//       } catch (error) {
//         console.error("Error loading page:", error);

//         await Actions.fireNotificationEvent(context, {
//           summary: 'Error',
//           message: 'Failed to load page: ' + error.message,
//           type: 'error',
//           displayMode: 'transient',
//         });
//       } finally {
//         // Close progress dialog
//         await Actions.callComponentMethod(context, {
//           selector: '#progressMsg',
//           method: 'close',
//         });
//       }
//     }

//     // ========== EDIT MODE LOGIC ==========
//     async loadEditMode(context) {
//       const { $variables } = context;

//       // Set edit mode flag
//       $variables.editMode = 'edit';

//       // Step 1: Get Project Charter Header
//       const headerResponse = await Actions.callRest(context, {
//         endpoint: 'PAM/getPmispamProjectcharterHdrGetbyid',
//         headers: {
//           'x-session-id': $variables.pNavId,
//         },
//       });

//       if (headerResponse.body.count !== 1) {
//         throw new Error('Project Charter record not found');
//       }

//       const headerData = headerResponse.body.items[0];

//       // Destructuring and assign header data
//       const {
//         project_charter_id, object_version_num, project_id, project_charter_name,
//         project_category, ref_num, region_id, region_code, region_name, related_sons,
//         budget_number, principle_purpose, other_purpose, justification, main_feature,
//         oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
//         project_owner, execution_director, design, construction, testing_commissioning,
//         design_date, construction_date, testing_commissioning_date, tender_award,
//         estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
//         manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
//         additional_info, created_by, created_date, last_updated_by, last_updated_date,
//         last_updated_login, parent_project_charter_id, project_description, project_name
//       } = headerResponse.body.items?.[0] || {};

//       Object.assign($variables.projectCharterVar, {
//         project_charter_id, object_version_num, project_id, project_charter_name,
//         project_category, ref_num, region_id, region_code, region_name, related_sons,
//         project_number: budget_number, principle_purpose, other_purpose, justification, main_feature,
//         oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
//         project_owner, execution_director, design, construction, testing_commissioning,
//         design_date, construction_date, testing_commissioning_date, tender_award,
//         estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
//         manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
//         additional_info, created_by, created_date, last_updated_by, last_updated_date,
//         last_updated_login, parent_project_charter_id, project_description, project_name
//       });

//       console.log(
//         "%cProjectCharterVar assigned",
//         "color:#2f9e44;font-weight:bold;",
//         { ...$variables.projectCharterVar }
//       );

//       await Actions.fireDataProviderEvent(context, {
//         refresh: null,
//         target: $variables.projectCharterSDP,
//       });

//       // Step 3: Load Estimate Cost Lines
//       await this.loadEstimateCostLines(context, headerData.project_charter_id);

//       // Step 4: Load Major Risk Lines
//       await this.loadMajorRiskLines(context, headerData.project_charter_id);

//       // Step 5: Load Dependency Lines
//       await this.loadDependencyLines(context, headerData.project_charter_id);
//     }

//     // ========== CREATE MODE LOGIC ==========
//     async loadCreateMode(context) {
//       const { $variables } = context;

//       // Set create mode flag
//       $variables.editMode = 'add';
//       $variables.projectCharterVar.object_version_num = 0;

//       // Clear child table data
//       $variables.ADPestimateCost.data = [];
//       $variables.ADPmajorRisk.data    = [];
//       $variables.ADPdependency.data   = [];

//       // Clear form variables
//       $variables.estimateCostVar = {};
//       $variables.majorRiskVar    = {};
//       $variables.dependencyVar   = {};
//     }

//     // ========== HELPER: Load Estimate Cost Lines ==========
//     async loadEstimateCostLines(context, projectCharterId) {
//       const { $variables } = context;

//       try {
//         const response = await Actions.callRest(context, {
//           endpoint: 'PAM/getPmispamProjectcharterEstcostGetbyid',
//           headers: {
//             'x-session-id': $variables.pNavId,
//           },
//         });

//         $variables.ADPestimateCost.data = response.body.count > 0 ? response.body.items : [];

//         console.log(
//           "%cEstimate Cost Lines loaded",
//           "color:#1971c2;font-weight:bold;",
//           $variables.ADPestimateCost.data
//         );

//       } catch (error) {
//         $variables.ADPestimateCost.data = [];
//         console.warn("No estimate cost lines found or error loading:", error);
//       }
//     }

//     // ========== HELPER: Load Major Risk Lines ==========
//     async loadMajorRiskLines(context, projectCharterId) {
//       const { $variables } = context;

//       try {
//         const response = await Actions.callRest(context, {
//           endpoint: 'PAM/getPmispamProjectcharterRiskGetbyid',
//           headers: {
//             'x-session-id': $variables.pNavId,
//           },
//         });

//         $variables.ADPmajorRisk.data = response.body.count > 0 ? response.body.items : [];

//         console.log(
//           "%cMajor Risk Lines loaded",
//           "color:#e03131;font-weight:bold;",
//           $variables.ADPmajorRisk.data
//         );

//       } catch (error) {
//         $variables.ADPmajorRisk.data = [];
//         console.warn("No major risk lines found or error loading:", error);
//       }
//     }

//     // ========== HELPER: Load Dependency Lines ==========
//     async loadDependencyLines(context, projectCharterId) {
//       const { $variables } = context;

//       try {
//         const response = await Actions.callRest(context, {
//           endpoint: 'PAM/getPmispamProjectcharterDependencyGetbyprojectcharterid',
//           uriParams: {
//             p_project_charter_id: $variables.pNavId,
//           },
//         });

//         $variables.ADPdependency.data = response.body.count > 0 ? response.body.items : [];

//         console.log(
//           "%cDependency Lines loaded",
//           "color:#0ca678;font-weight:bold;",
//           $variables.ADPdependency.data
//         );

//       } catch (error) {
//         $variables.ADPdependency.data = [];
//         console.warn("No dependency lines found or error loading:", error);
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
      const { $page, $variables, $application } = context;

      // Open progress dialog
      await Actions.callComponentMethod(context, {
        selector: '#progressMsg',
        method: 'open',
      });

      try {
        if ($variables.pNavCode === "EDIT") {
          // ========== EDIT MODE ==========
          await this.loadEditMode(context);

          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              statusCode: $variables.projectCharterVar.status_code,
              taskId: $variables.taskId,
              appr_level: $variables.current_level,
            },
          });
        } else {
          // ========== CREATE MODE ==========
          await this.loadCreateMode(context);

          await Actions.callChain(context, {
            chain: 'toolBarAC',
            params: {
              statusCode: 'DRA',
            },
          });
        }
      } catch (error) {
        console.error("Error loading page:", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load page: ' + error.message,
          type: 'error',
          displayMode: 'transient',
        });
      } finally {
        // Close progress dialog
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
      }
    }

    // ========== EDIT MODE LOGIC ==========
    async loadEditMode(context) {
      const { $variables, $application } = context;

      // Set edit mode flag
      $variables.editMode = 'edit';

      if ($variables.taskId != null) {
        const headerResponse = await Actions.callRest(context, {
          endpoint: 'approval/getTransactionProjectcharterGetbyhdrid',
          headers: {
            'p_trx_id': $variables.pNavId,
          },
        });

        const headerResponse2 = await Actions.callRest(context, {
          endpoint: 'approval/getGetactionbytrxid',
          headers: {
            'p_transaction_id': headerResponse.body.items[0].project_charter_id,
          },
        });

        $variables.current_level = headerResponse2.body.items[0].approver_level || 0;

         if (headerResponse.body.count !== 1) {
          throw new Error('Project Charter record not found');
        }

        const headerData = headerResponse.body.items[0];

        // Destructuring and assign header data
        const {
          project_charter_id, object_version_num, project_id, project_charter_name,
          project_category, ref_num, region_id, region_code, region_name, related_sons,
          budget_number, principle_purpose, other_purpose, justification, main_feature,
          oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
          project_owner, execution_director, design, construction, testing_commissioning,
          design_date, construction_date, testing_commissioning_date, tender_award,
          estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
          manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
          additional_info, created_by, created_date, last_updated_by, last_updated_date,
          last_updated_login, parent_project_charter_id, project_description, project_name, strength, 
          project_objective, success_criteria, project_scope, weakness, opportunities, threats, 
          hse_integration_req, approver_id, project_title, revision, responsibilities, workflow_status
        } = headerResponse.body.items?.[0] || {};

        // const headerResponse = await Actions.callRest(context, {
        //   endpoint: 'approval/getTransactionProjectcharterGetbyhdrid',
        // });

        Object.assign($variables.projectCharterVar, {
          project_charter_id, object_version_num, project_id, project_charter_name,
          project_category, ref_num, region_id, region_code, region_name, related_sons,
          project_number: budget_number, principle_purpose, other_purpose, justification, main_feature,
          oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
          project_owner, execution_director, design, construction, testing_commissioning,
          design_date, construction_date, testing_commissioning_date, tender_award,
          estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
          manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
          additional_info, created_by, created_date, last_updated_by, last_updated_date,
          last_updated_login, parent_project_charter_id, project_description, project_name, strength, 
          project_objective, success_criteria, project_scope, weakness, opportunities, threats, 
          hse_integration_req, approver_id, project_title, revision, responsibilities, workflow_status
        });

        // Make the charter ID available to attachment chains
        $variables.projectCharterId = project_charter_id;
        $variables.qhseVar.initiator_contact = headerData.created_by;
        $variables.qhseVar.initiation_date = headerData.created_date;
        $variables.qhseVar.initiator_signature = headerData.created_by + ' | ' + $application.functions.dateConverion(headerData.created_date);

        console.log(
          "%cProjectCharterVar assigned",
          "color:#2f9e44;font-weight:bold;",
          { ...$variables.projectCharterVar }
        );

        await Actions.fireDataProviderEvent(context, {
          refresh: null,
          target: $variables.projectCharterSDP,
        });

        // Step 3: Load Estimate Cost Lines
        await this.loadEstimateCostLines(context, headerData.project_charter_id);

        // Step 4: Load Major Risk Lines
        await this.loadMajorRiskLines(context, headerData.project_charter_id);

        // Step 5: Load Dependency Lines
        await this.loadDependencyLines(context, headerData.project_charter_id);

        // Step 6: Load Milestone Lines
        await this.loadMilestoneLines(context);

        // Step 7: Load Mandatory Reference Documents with attachment counts
        await Actions.callChain(context, { chain: 'load_mandatory_ref_doc' });
      } 
      else {
         // Step 1: Get Project Charter Header

         const headerResponse = await Actions.callRest(context, {
           endpoint: 'PAM/getPmispamProjectcharterHdrGetbyid',
           headers: {
             'x-session-id': $variables.pNavId,
           },
         });

        if (headerResponse.body.count !== 1) {
          throw new Error('Project Charter record not found');
        }

        const headerData = headerResponse.body.items[0];

        // Destructuring and assign header data
        const {
          project_charter_id, object_version_num, project_id, project_charter_name,
          project_category, ref_num, region_id, region_code, region_name, related_sons,
          budget_number, principle_purpose, other_purpose, justification, main_feature,
          oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
          project_owner, execution_director, design, construction, testing_commissioning,
          design_date, construction_date, testing_commissioning_date, tender_award,
          estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
          manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
          additional_info, created_by, created_date, last_updated_by, last_updated_date,
          last_updated_login, parent_project_charter_id, project_description, project_name, strength, 
          project_objective, success_criteria, project_scope, weakness, opportunities, threats, 
          hse_integration_req, approver_id, project_title, revision, responsibilities, workflow_status
        } = headerResponse.body.items?.[0] || {};

        // const headerResponse = await Actions.callRest(context, {
        //   endpoint: 'approval/getTransactionProjectcharterGetbyhdrid',
        // });

        Object.assign($variables.projectCharterVar, {
          project_charter_id, object_version_num, project_id, project_charter_name,
          project_category, ref_num, region_id, region_code, region_name, related_sons,
          project_number: budget_number, principle_purpose, other_purpose, justification, main_feature,
          oper_philosophy, capex_requirement, location_pl, service_req_obj, overview_project,
          project_owner, execution_director, design, construction, testing_commissioning,
          design_date, construction_date, testing_commissioning_date, tender_award,
          estimated_capex_cost, estimated_opex_cost, procurement_assumption, operating_principle,
          manager_status, wf_item_type, wf_item_key, status_id, status_code, status_name,
          additional_info, created_by, created_date, last_updated_by, last_updated_date,
          last_updated_login, parent_project_charter_id, project_description, project_name, strength, 
          project_objective, success_criteria, project_scope, weakness, opportunities, threats, 
          hse_integration_req, approver_id, project_title, revision, responsibilities, workflow_status
        });

        // Make the charter ID available to attachment chains
        $variables.projectCharterId = project_charter_id;
        $variables.qhseVar.initiator_contact = headerData.created_by;
        $variables.qhseVar.initiation_date = headerData.created_date;
        $variables.qhseVar.initiator_signature = headerData.created_by + ' | ' + $application.functions.dateConverion(headerData.created_date);

        console.log(
          "%cProjectCharterVar assigned",
          "color:#2f9e44;font-weight:bold;",
          { ...$variables.projectCharterVar }
        );

        await Actions.fireDataProviderEvent(context, {
          refresh: null,
          target: $variables.projectCharterSDP,
        });

        // Step 3: Load Estimate Cost Lines
        await this.loadEstimateCostLines(context, headerData.project_charter_id);

        // Step 4: Load Major Risk Lines
        await this.loadMajorRiskLines(context, headerData.project_charter_id);

        // Step 5: Load Dependency Lines
        await this.loadDependencyLines(context, headerData.project_charter_id);

        // Step 6: Load Milestone Lines
        await this.loadMilestoneLines(context);

        // Step 7: Load Mandatory Reference Documents with attachment counts
        await Actions.callChain(context, { chain: 'load_mandatory_ref_doc' });
      }
    }

    // ========== CREATE MODE LOGIC ==========
    async loadCreateMode(context) {
      const { $variables } = context;

      // Set create mode flag
      $variables.editMode = 'add';
      $variables.projectCharterVar.object_version_num = 0;

      // Clear child table data
      $variables.ADPestimateCost.data = [];
      $variables.ADPmajorRisk.data    = [];
      $variables.ADPdependency.data   = [];
      $variables.ADPmilestone.data    = [];

      // Clear form variables
      $variables.estimateCostVar = {};
      $variables.majorRiskVar    = {};
      $variables.dependencyVar   = {};
      $variables.milestoneVar    = { milestone_id: 0 };

      // Load mandatory ref doc list (no attachment counts yet in create mode)
      await Actions.callChain(context, { chain: 'load_mandatory_ref_doc' });
    }

    // ========== HELPER: Load Estimate Cost Lines ==========
    async loadEstimateCostLines(context, projectCharterId) {
      const { $variables } = context;

      try {
        let sessionId = $variables.pNavId;
        if($variables.taskId != null) {
          const enc_pNavId_from_pendingList = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.pNavId,
            },
          });
          sessionId = enc_pNavId_from_pendingList;
        }
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterEstcostGetbyid',
          headers: {
            // 'x-session-id': $variables.pNavId,
            'x-session-id': sessionId
          },
        });
        $variables.ADPestimateCost.data = response.body.count > 0 ? response.body.items : [];

        console.log(
          "%cEstimate Cost Lines loaded",
          "color:#1971c2;font-weight:bold;",
          $variables.ADPestimateCost.data
        );

      } catch (error) {
        $variables.ADPestimateCost.data = [];
        console.warn("No estimate cost lines found or error loading:", error);
      }
    }

    // ========== HELPER: Load Major Risk Lines ==========
    async loadMajorRiskLines(context, projectCharterId) {
      const { $variables } = context;

      try {
        let sessionId = $variables.pNavId;
        if($variables.taskId != null) {
          const enc_pNavId_from_pendingList = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.pNavId,
            },
          });
          sessionId = enc_pNavId_from_pendingList;
        }
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterRiskGetbyid',
          headers: {
            // 'x-session-id': $variables.pNavId,
            'x-session-id': sessionId
          },
        });

        $variables.ADPmajorRisk.data = response.body.count > 0 ? response.body.items : [];

        console.log(
          "%cMajor Risk Lines loaded",
          "color:#e03131;font-weight:bold;",
          $variables.ADPmajorRisk.data
        );

      } catch (error) {
        $variables.ADPmajorRisk.data = [];
        console.warn("No major risk lines found or error loading:", error);
      }
    }

    // ========== HELPER: Load Dependency Lines ==========
    async loadDependencyLines(context, projectCharterId) {
      const { $variables } = context;

      try {
        let sessionId = $variables.pNavId;
        if($variables.taskId != null) {
          const enc_pNavId_from_pendingList = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.pNavId,
            },
          });
          sessionId = enc_pNavId_from_pendingList;
        }
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterDependencyGetbyprojectcharterid',
          uriParams: {
            // p_project_charter_id: $variables.pNavId,
            p_project_charter_id: sessionId
          },
        });

        $variables.ADPdependency.data = response.body.count > 0 ? response.body.items : [];

        console.log(
          "%cDependency Lines loaded",
          "color:#0ca678;font-weight:bold;",
          $variables.ADPdependency.data
        );

      } catch (error) {
        $variables.ADPdependency.data = [];
        console.warn("No dependency lines found or error loading:", error);
      }
    }

    // ========== HELPER: Load Milestone Lines ==========
    async loadMilestoneLines(context) {
      // Delegates to the standalone loadMilestones action chain
      await Actions.callChain(context, { chain: 'loadMilestones' });
    }
  }

  return vbAfterNavigateListener;
});