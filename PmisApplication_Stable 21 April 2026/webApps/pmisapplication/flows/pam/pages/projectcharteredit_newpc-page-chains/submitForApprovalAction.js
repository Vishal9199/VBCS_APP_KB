// define([
//   'vb/action/actionChain',
//   'vb/action/actions'
// ], (
//   ActionChain,
//   Actions
// ) => {
//   'use strict';

//   class submitForApprovalAction extends ActionChain {

//     /**
//      * Submit For Approval Action - Saves and submits Project Charter for approval
//      * Approval Flow:
//      * 1. Asset Planning Manager (Level 1) - can choose CPD GM/OPD GM or Asset Planning General Manager
//      * 2. Asset Planning General Manager (Level 2) - can only choose Asset Engineering General Manager
//      * 3. Asset Engineering General Manager (Level 3) - can choose CPD GM/OPD GM or Asset Engineering Team
//      * 4. Asset Engineering Team - can close request or initiate another PC
//      * 5. CPD GM/OPD GM (Level 4) - Final Approver
//      * 
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $variables, $application, $functions, $constants } = context;

//       const loadingDialogOpen = await Actions.callComponentMethod(context, {
//         selector: '#loadingDialog',
//         method: 'open',
//       });

//       try {
//         const isValid = $variables.formObj?.addDialogValidate === 'valid';

//         if (!isValid) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Please enter all mandatory fields.',
//             displayMode: 'persist',
//             type: 'warning',
//           });

//           const loadingDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#loadingDialog',
//             method: 'close',
//           });
//           return;
//         }

//         let saveSuccessful = false;
//         const isEdit = $variables.editMode === 'edit';

//         const payload = {
//           object_version_num: $variables.projectCharterVar.object_version_num,
//           project_title: $variables.projectCharterVar.project_title,
//           project_id: $variables.projectCharterVar.project_id,
//           parent_project_charter_id: $variables.projectCharterVar.parent_project_charter_id,
//           project_description: $variables.projectCharterVar.project_description,
//           revision: $variables.projectCharterVar.revision,
//           region_id: $variables.projectCharterVar.region_id,
//           related_sons: $variables.projectCharterVar.related_sons,
//           project_number: $variables.projectCharterVar.project_number,
//           principle_purpose: $variables.projectCharterVar.principle_purpose,
//           other_purpose: $variables.projectCharterVar.other_purpose,
//           justification: $variables.projectCharterVar.justification,
//           main_feature: $variables.projectCharterVar.main_feature,
//           oper_philosophy: $variables.projectCharterVar.oper_philosophy,
//           capex_requirement: $variables.projectCharterVar.capex_requirement,
//           location_pl: $variables.projectCharterVar.location_pl,
//           service_req_obj: $variables.projectCharterVar.service_req_obj,
//           overview_project: $variables.projectCharterVar.overview_project,
//           project_owner: $variables.projectCharterVar.project_owner,
//           execution_director: $variables.projectCharterVar.execution_director,
//           design: $variables.projectCharterVar.design,
//           construction: $variables.projectCharterVar.construction,
//           testing_commissioning: $variables.projectCharterVar.testing_commissioning,
//           project_scope: $variables.projectCharterVar.project_scope,
//           project_objective: $variables.projectCharterVar.project_objective,
//           success_criteria: $variables.projectCharterVar.success_criteria,
//           strength: $variables.projectCharterVar.strength,
//           weakness: $variables.projectCharterVar.weakness,
//           opportunities: $variables.projectCharterVar.opportunities,
//           threats: $variables.projectCharterVar.threats,
//           hse_integration_req: $variables.projectCharterVar.hse_integration_req,
//           responsibilities: $variables.projectCharterVar.responsibilities,
//           design_date: this.formatDateForOracle($variables.projectCharterVar.design_date),
//           construction_date: this.formatDateForOracle($variables.projectCharterVar.construction_date),
//           testing_commissioning_date: this.formatDateForOracle($variables.projectCharterVar.testing_commissioning_date),
//           tender_award: this.formatDateForOracle($variables.projectCharterVar.tender_award),
//           estimated_capex_cost: $variables.projectCharterVar.estimated_capex_cost,
//           estimated_opex_cost: $variables.projectCharterVar.estimated_opex_cost,
//           procurement_assumption: $variables.projectCharterVar.procurement_assumption,
//           operating_principle: $variables.projectCharterVar.operating_principle,
//           approver_id: $variables.projectCharterVar.approver_id,
//           manager_status: $variables.projectCharterVar.manager_status,
//           wf_item_type: $variables.projectCharterVar.wf_item_type,
//           wf_item_key: $variables.projectCharterVar.wf_item_key,
//           additional_info: $variables.projectCharterVar.additional_info,
//           last_updated_by: $application.user.email || 'CURRENT_USER',
//           last_updated_login: $application.user.email || 'CURRENT_USER',
//         };

//         if (isEdit) {
//           payload.project_charter_id = $variables.projectCharterVar.project_charter_id;
//           payload.ref_num = $variables.projectCharterVar.ref_num;
//           payload.status_id = $variables.projectCharterVar.status_id;

//           const method = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: { input: 'PUT' },
//           });

//           const encryptedPayload = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: { input: payload },
//           });

//           const response = await Actions.callRest(context, {
//             endpoint: 'PAM/postPmisProjectCharterProcess',
//             headers: {
//               'x-session-id': $variables.pNavId,
//               'x-session-code': method,
//             },
//             body: {
//               payload: encryptedPayload,
//             },
//           });

//           if (response.body.P_ERR_CODE === 'S') {
//             $variables.projectCharterVar.object_version_num =
//               ($variables.projectCharterVar.object_version_num || 1) + 1;
//             saveSuccessful = true;
//           } else {
//             await Actions.fireNotificationEvent(context, {
//               summary: response.body.P_ERR_MSG || 'Error saving Project Charter.',
//               type: 'error',
//               displayMode: 'persist',
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });
//             return;
//           }
//         } else {
//           payload.created_by = $application.user.email || 'CURRENT_USER';

//           const encryptedKey = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: { input: '0' },
//           });

//           const method = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: { input: 'POST' },
//           });

//           const encryptedPayload = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: { input: payload },
//           });

//           const postResp = await Actions.callRest(context, {
//             endpoint: 'PAM/postPmisProjectCharterProcess',
//             headers: {
//               'x-session-id': encryptedKey,
//               'x-session-code': method,
//             },
//             body: {
//               payload: encryptedPayload,
//             },
//           });

//           if (postResp.body.P_ERR_CODE === 'S') {
//             const newProjectId = postResp.headers.get('X-Session-Id')
//               || postResp.headers.get('x-session-id')
//               || postResp.headers.get('X-session-id');

//             $variables.projectCharterVar.object_version_num = postResp.body.object_version_num || 1;
//             $variables.projectCharterVar.project_number = postResp.body.project_number;
//             $variables.editMode = 'edit';
//             $variables.pNavCode = 'EDIT';
//             $variables.pNavId = newProjectId;
//             saveSuccessful = true;
//           } else {
//             await Actions.fireNotificationEvent(context, {
//               summary: postResp.body.P_ERR_MSG || 'Error creating Project Charter.',
//               type: 'error',
//               displayMode: 'persist',
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });
//             return;
//           }
//         }

//         if (saveSuccessful) {
//           $variables.SubmitVar = $variables.SubmitVar || {};

//           $variables.SubmitVar.P_TRX_ID = $variables.projectCharterId;
//           $variables.SubmitVar.P_USER_ID = $application.variables.getEmployeeDetailTypeVar?.user_id;
//           $variables.SubmitVar.P_APPR_PROCESS = $constants.apprProcess || "PROJECT_CHARTER";

//           if ($variables.projectCharterVar.status_code === 'RIM') {
//             $variables.SubmitVar.P_TYPE = "MORE_INFO";
//           }

//           const response = await Actions.callRest(context, {
//             endpoint: 'approval/postSubmit',
//             body: $variables.SubmitVar,
//           });

//           if (!response.ok) {
//             await Actions.fireNotificationEvent(context, {
//               summary: 'Approval API Error',
//               type: 'error',
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });
//             return;
//           }

//           if (response.body.P_ERROR_CODE === 'S') {
//             $variables.submitProcess = $variables.submitProcess || { params: {}, dataObject: { startWebFormArgs: {} } };
//             $variables.submitProcess.params.applicationName = 'ProjectCharter';
//             $variables.submitProcess.params.processName = 'MyStructuredProcess';
//             $variables.submitProcess.params.applicationVersion = '1.0';
//             $variables.submitProcess.dataObject.startWebFormArgs.callSubmitPackage = 'NO';
//             $variables.submitProcess.dataObject.startWebFormArgs.p_APPR_PROCESS = $constants.apprProcess || 'PROJECT_CHARTER';
//             $variables.submitProcess.dataObject.startWebFormArgs.p_TRX_ID = $variables.projectCharterId;
//             $variables.submitProcess.dataObject.startWebFormArgs.p_ACTION_ID = response.body.P_ACTION_ID;
//             $variables.submitProcess.dataObject.startWebFormArgs.p_USER_ID = $application.variables.getEmployeeDetailTypeVar?.user_id;

//             const response2 = await Actions.callRest(context, {
//               endpoint: 'processapi/postProcessApiV1Instances',
//               body: $variables.submitProcess,
//             });

//             if (!response2.ok) {
//               await Actions.fireNotificationEvent(context, {
//                 summary: 'PCS Error',
//                 type: 'error',
//                 displayMode: 'transient'
//               });

//               const loadingDialogClose = await Actions.callComponentMethod(context, {
//                 selector: '#loadingDialog',
//                 method: 'close',
//               });
//               return;
//             }

//             await Actions.fireNotificationEvent(context, {
//               summary: 'Submitted For Approval Successfully',
//               displayMode: 'transient',
//               type: 'confirmation',
//             });

//             await this.refreshData(context);
//           } else if (response.body.P_ERROR_CODE === 'E') {
//             await Actions.fireNotificationEvent(context, {
//               summary: response.body.P_ERROR_MSG,
//               type: 'error',
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });
//           } else {
//             await Actions.fireNotificationEvent(context, {
//               summary: response.body.P_ERROR_MSG || 'Unknown error occurred',
//               type: 'error',
//               displayMode: 'transient'
//             });

//             const loadingDialogClose = await Actions.callComponentMethod(context, {
//               selector: '#loadingDialog',
//               method: 'close',
//             });
//           }
//         }
//       } catch (error) {
//         await Actions.fireNotificationEvent(context, {
//           summary: 'An error occurred during submission',
//           type: 'error',
//         });

//         const loadingDialogClose = await Actions.callComponentMethod(context, {
//           selector: '#loadingDialog',
//           method: 'close',
//         });
//       }
//     }

//     formatDateForOracle(dateValue) {
//       if (!dateValue) return null;
//       try {
//         const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
//         if (isNaN(date.getTime())) return null;
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//       } catch (error) {
//         return null;
//       }
//     }

//     async refreshData(context) {
//       const { $variables, $application, $functions, $constants } = context;

//       if ($variables.editMode === 'edit') {
//         const response = await Actions.callRest(context, {
//           endpoint: 'PAM/getPmispamProjectcharterHdrGetbyid',
//           headers: {
//             'x-session-id': $variables.pNavId,
//           },
//         });

//         if (response.ok && response.body.items && response.body.items.length > 0) {
//           Object.assign($variables.projectCharterVar, response.body.items[0]);
//         }

//         await new Promise(resolve => setTimeout(resolve, 500));

//         const loadingDialogClose = await Actions.callComponentMethod(context, {
//           selector: '#loadingDialog',
//           method: 'close',
//         });
//       }
//     }
//   }

//   return submitForApprovalAction;
// });



define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class submitForApprovalAction extends ActionChain {

    /**
     * Submit For Approval Action - Saves and submits Project Charter for approval
     * Approval Flow:
     * 1. Asset Planning Manager (Level 1) - can choose CPD GM/OPD GM or Asset Planning General Manager
     * 2. Asset Planning General Manager (Level 2) - can only choose Asset Engineering General Manager
     * 3. Asset Engineering General Manager (Level 3) - can choose CPD GM/OPD GM or Asset Engineering Team
     * 4. Asset Engineering Team - can close request or initiate another PC
     * 5. CPD GM/OPD GM (Level 4) - Final Approver
     * 
     * @param {Object} context
     */
    async run(context) {
      const { $variables, $application, $functions, $constants } = context;

      const loadingDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#loadingDialog',
        method: 'open',
      });

      try {
        const isValid = $variables.formObj?.addDialogValidate === 'valid';

        if (!isValid) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Please enter all mandatory fields.',
            displayMode: 'persist',
            type: 'warning',
          });

          const loadingDialogClose = await Actions.callComponentMethod(context, {
            selector: '#loadingDialog',
            method: 'close',
          });
          return;
        }

        const isEdit = $variables.editMode === 'edit';

        if (!isEdit) {
          // CREATE MODE: Save the record first, then submit
          const payload = {
            object_version_num: $variables.projectCharterVar.object_version_num,
            project_title: $variables.projectCharterVar.project_title,
            project_id: $variables.projectCharterVar.project_id,
            parent_project_charter_id: $variables.projectCharterVar.parent_project_charter_id,
            project_description: $variables.projectCharterVar.project_description,
            revision: $variables.projectCharterVar.revision,
            region_id: $variables.projectCharterVar.region_id,
            related_sons: $variables.projectCharterVar.related_sons,
            project_number: $variables.projectCharterVar.project_number,
            principle_purpose: $variables.projectCharterVar.principle_purpose,
            other_purpose: $variables.projectCharterVar.other_purpose,
            main_feature: $variables.projectCharterVar.main_feature,
            oper_philosophy: $variables.projectCharterVar.oper_philosophy,
            capex_requirement: $variables.projectCharterVar.capex_requirement,
            location_pl: $variables.projectCharterVar.location_pl,
            service_req_obj: $variables.projectCharterVar.service_req_obj,
            overview_project: $variables.projectCharterVar.overview_project,
            project_owner: $variables.projectCharterVar.project_owner,
            execution_director: $variables.projectCharterVar.execution_director,
            design: $variables.projectCharterVar.design,
            construction: $variables.projectCharterVar.construction,
            testing_commissioning: $variables.projectCharterVar.testing_commissioning,
            design_date: this.formatDateForOracle($variables.projectCharterVar.design_date),
            construction_date: this.formatDateForOracle($variables.projectCharterVar.construction_date),
            testing_commissioning_date: this.formatDateForOracle($variables.projectCharterVar.testing_commissioning_date),
            tender_award: this.formatDateForOracle($variables.projectCharterVar.tender_award),
            estimated_capex_cost: $variables.projectCharterVar.estimated_capex_cost,
            estimated_opex_cost: $variables.projectCharterVar.estimated_opex_cost,
            operating_principle: $variables.projectCharterVar.operating_principle,
            approver_id: $variables.projectCharterVar.approver_id,
            manager_status: $variables.projectCharterVar.manager_status,
            wf_item_type: $variables.projectCharterVar.wf_item_type,
            wf_item_key: $variables.projectCharterVar.wf_item_key,
            created_by: $application.user.email || 'CURRENT_USER',
            last_updated_by: $application.user.email || 'CURRENT_USER',
            last_updated_login: $application.user.email || 'CURRENT_USER',
          };

          const encryptedKey = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: '0' },
          });

          const method = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: 'POST' },
          });

          const encryptedPayload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: payload },
          });

          const postResp = await Actions.callRest(context, {
            endpoint: 'PAM/postPmisProjectCharterProcess',
            headers: {
              'x-session-id': encryptedKey,
              'x-session-code': method,
            },
            body: {
              payload: encryptedPayload,
            },
          });

          if (postResp.body.P_ERR_CODE === 'S') {
            const newProjectId = postResp.headers.get('X-Session-Id')
              || postResp.headers.get('x-session-id')
              || postResp.headers.get('X-session-id');

            $variables.projectCharterVar.object_version_num = postResp.body.object_version_num || 1;
            $variables.projectCharterVar.project_number = postResp.body.project_number;
            $variables.editMode = 'edit';
            $variables.pNavCode = 'EDIT';
            $variables.pNavId = newProjectId;
            await this.saveClobFields(context);
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: postResp.body.P_ERR_MSG || 'Error creating Project Charter.',
              type: 'error',
              displayMode: 'persist',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
            return;
          }
        }

        // EDIT MODE: Skip save, directly submit; CREATE MODE: save done above, now submit
        {
          $variables.SubmitVar = $variables.SubmitVar || {};

          $variables.SubmitVar.P_TRX_ID = $variables.projectCharterId;
          $variables.SubmitVar.P_USER_ID = $application.variables.getEmployeeDetailTypeVar?.user_id;
          $variables.SubmitVar.P_APPR_PROCESS = $constants.apprProcess || "PROJECT_CHARTER";

          // if ($variables.projectCharterVar.status_code === 'RIM' || $variables.projectCharterVar.status_code === 'RIA') {
          if ($variables.projectCharterVar.status_code === 'RIM') {
            $variables.SubmitVar.P_TYPE = "MORE_INFO";
          }
          // if ($variables.projectCharterVar.status_code === 'RIM' || $variables.projectCharterVar.status_code === 'RIA') {
          if ($variables.projectCharterVar.status_code === 'RIA') {
            const response = await Actions.callRest(context, {
              endpoint: 'approval/getGetactionApprrequestcode',
              headers: {
                 'p_transaction_id': $variables.projectCharterVar.project_charter_id,
              }
            });
            $variables.SubmitVar.P_APPR_PROCESS = response.body.items[0].appr_request_code || 'PMIS_PROJECT_CHARTER_ET';
          }

          const response = await Actions.callRest(context, {
            endpoint: 'approval/postSubmit',
            body: $variables.SubmitVar,
          });

          if (!response.ok) {
            await Actions.fireNotificationEvent(context, {
              summary: 'Approval API Error',
              type: 'error',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
            return;
          }

          if (response.body.P_ERROR_CODE === 'S') {
            $variables.submitProcess = $variables.submitProcess || { params: {}, dataObject: { startWebFormArgs: {} } };
            $variables.submitProcess.params.applicationName = 'ProjectCharter';
            $variables.submitProcess.params.processName = 'MyStructuredProcess';
            $variables.submitProcess.params.applicationVersion = '1.0';
            $variables.submitProcess.dataObject.startWebFormArgs.callSubmitPackage = 'NO';
            $variables.submitProcess.dataObject.startWebFormArgs.p_APPR_PROCESS = $constants.apprProcess || 'PROJECT_CHARTER';
            $variables.submitProcess.dataObject.startWebFormArgs.p_TRX_ID = $variables.projectCharterId;
            $variables.submitProcess.dataObject.startWebFormArgs.p_ACTION_ID = response.body.P_ACTION_ID;
            $variables.submitProcess.dataObject.startWebFormArgs.p_USER_ID = $application.variables.getEmployeeDetailTypeVar?.user_id;

            const response2 = await Actions.callRest(context, {
              endpoint: 'processapi/postProcessApiV1Instances',
              body: $variables.submitProcess,
            });

            if (!response2.ok) {
              await Actions.fireNotificationEvent(context, {
                summary: 'PCS Error',
                type: 'error',
                displayMode: 'transient'
              });

              const loadingDialogClose = await Actions.callComponentMethod(context, {
                selector: '#loadingDialog',
                method: 'close',
              });
              return;
            }

            await Actions.fireNotificationEvent(context, {
              summary: 'Submitted For Approval Successfully',
              displayMode: 'transient',
              type: 'confirmation',
            });

            await this.refreshData(context);
          } else if (response.body.P_ERROR_CODE === 'E') {
            await Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERROR_MSG,
              type: 'error',
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
          } else {
            await Actions.fireNotificationEvent(context, {
              summary: response.body.P_ERROR_MSG || 'Unknown error occurred',
              type: 'error',
              displayMode: 'transient'
            });

            const loadingDialogClose = await Actions.callComponentMethod(context, {
              selector: '#loadingDialog',
              method: 'close',
            });
          }
        }
      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'An error occurred during submission',
          type: 'error',
        });

        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      }
    }

    async saveClobFields(context) {
      const { $variables, $application } = context;

      const clobFields = [
        { typeCode: 'JUSTIFICATION', value: $variables.projectCharterVar.justification },
        { typeCode: 'PROJECT_SCOPE', value: $variables.projectCharterVar.project_scope },
        { typeCode: 'PROJECT_OBJECTIVE', value: $variables.projectCharterVar.project_objective },
        { typeCode: 'SUCCESS_CRITERIA', value: $variables.projectCharterVar.success_criteria },
        { typeCode: 'STRENGTH', value: $variables.projectCharterVar.strength },
        { typeCode: 'WEAKNESS', value: $variables.projectCharterVar.weakness },
        { typeCode: 'OPPORTUNITIES', value: $variables.projectCharterVar.opportunities },
        { typeCode: 'THREATS', value: $variables.projectCharterVar.threats },
        { typeCode: 'HSE_INTEGRATION_REQ', value: $variables.projectCharterVar.hse_integration_req },
        { typeCode: 'RESPONSIBILITIES', value: $variables.projectCharterVar.responsibilities },
        { typeCode: 'PROCUREMENT_ASSUMPTION', value: $variables.projectCharterVar.procurement_assumption },
        { typeCode: 'ADDITIONAL_INFO', value: $variables.projectCharterVar.additional_info },
      ];

      for (const field of clobFields) {
        if (field.value && field.value.trim() !== '') {
          try {
            const encTypeCode = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: field.typeCode },
            });

            const encObjVer = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String($variables.projectCharterVar.object_version_num) },
            });

            const resp = await Actions.callRest(context, {
              endpoint: 'PAM/postPmispamProjectcharterPutnewdata',
              headers: {
                'x-session-id': $variables.pNavId,
                'x-type-code': encTypeCode,
                'x-obj-version': encObjVer,
                'x-session-user': $application.user.email,
              },
              body: {
                payload: field.value,
              },
            });

            if (resp.body.P_ERR_CODE === 'S') {
              $variables.projectCharterVar.object_version_num += 1;
            } else {
              console.error('CLOB save failed for ' + field.typeCode + ':', resp.body.P_ERR_MSG);
            }
          } catch (clobErr) {
            console.error('CLOB save error for ' + field.typeCode + ':', clobErr);
          }
        }
      }
    }

    formatDateForOracle(dateValue) {
      if (!dateValue) return null;
      try {
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        return null;
      }
    }

    async refreshData(context) {
      const { $variables, $application, $functions, $constants } = context;

      if ($variables.editMode === 'edit') {
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamProjectcharterHdrGetbyid',
          headers: {
            'x-session-id': $variables.pNavId,
          },
        });

        if (response.ok && response.body.items && response.body.items.length > 0) {
          Object.assign($variables.projectCharterVar, response.body.items[0]);
        }

        // toolbar should refresh based on new status
      await Actions.callChain(context, {
        chain: 'toolBarAC',
        params: {
          statusCode: $variables.projectCharterVar.status_code,
          taskId: $variables.taskId,
          appr_level: $variables.current_level,
        },
      });

        await new Promise(resolve => setTimeout(resolve, 500));

        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });
      }
    }
  }

  return submitForApprovalAction;
});