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

//   class saveAndCloseChain extends ActionChain {

//     /**
//      * Main Save and Close - Saves Header + Child Tables Sequentially
//      * @param {Object} context
//      * @param {Object} params
//      * @param {string} params.isSaveAndNavigate
//      */
//     async run(context, { isSaveAndNavigate = 'N' }) {
//       const { $page, $flow, $application, $variables } = context;

//       // Open progress dialog
//       await Actions.callComponentMethod(context, {
//         selector: '#progressMsg',
//         method: 'open',
//       });

//       try {
//         // ========== STEP 1: VALIDATE MAIN FORM ==========
//         const validationResult = await this.validateMainForm(context);
        
//         if (!validationResult.isValid) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Validation Error',
//             message: validationResult.message,
//             type: 'error',
//             displayMode: 'transient',
//           });
//           return;
//         }

//         // ========== STEP 2: SAVE PROJECT CHARTER HEADER ==========
//         if ($variables.editMode === 'edit') {
//           // ========== EDIT MODE ==========
//           await this.updateProjectCharter(context);
//         } else {
//           // ========== CREATE MODE ==========
//           await this.createProjectCharter(context);
//         }

//         // ========== STEP 3: NAVIGATE OR STAY ==========
//         if (isSaveAndNavigate === 'Y') {
//           const toProjectchartesearch = await Actions.navigateToPage(context, {
//             page: 'projectchartesearch',
//           });
//         }

//       } catch (error) {
//         console.error("❌ Error saving Project Charter:", error);
        
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Save Failed',
//           message: error.message || 'An error occurred while saving',
//           type: 'error',
//           displayMode: 'persist',
//         });

//       } finally {
//         // Close progress dialog
//         await Actions.callComponentMethod(context, {
//           selector: '#progressMsg',
//           method: 'close',
//         });
//       }
//     }

//     // ========== HELPER: VALIDATE MAIN FORM ==========
//     async validateMainForm(context) {
//       const { $variables } = context;

//       const requiredFields = [
//         // { 
//         //   field: 'region_id', label: 'Region' 
//         // },
//       ];

//       for (const requirement of requiredFields) {
//         const value = $variables.projectCharterVar[requirement.field];
        
//         if (!value || (typeof value === 'string' && value.trim() === '')) {
//           return {
//             isValid: false,
//             message: `${requirement.label} is required`
//           };
//         }
//       }

//       return { isValid: true };
//     }

//     // ========== HELPER: FORMAT DATE FOR ORACLE ==========
//     formatDateForOracle(dateValue) {
//       if (!dateValue) {
//         return null;
//       }

//       try {
//         let date;
        
//         if (dateValue instanceof Date) {
//           date = dateValue;
//         } else if (typeof dateValue === 'string') {
//           date = new Date(dateValue);
//         } else {
//           console.warn("⚠️ Unexpected date type:", typeof dateValue);
//           return null;
//         }

//         if (isNaN(date.getTime())) {
//           console.warn("⚠️ Invalid date value:", dateValue);
//           return null;
//         }

//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
        
//         const formatted = `${year}-${month}-${day}`;
//         console.log(`📅 Date formatted: ${dateValue} → ${formatted}`);
        
//         return formatted;

//       } catch (error) {
//         console.error("❌ Error formatting date:", error);
//         return null;
//       }
//     }

//     // ========== EDIT MODE - UPDATE ==========
//     async updateProjectCharter(context) {
//       const { $variables, $application } = context;

//       console.log("🔄 UPDATE MODE - Editing existing Project Charter");

//       // Step 1: Encrypt method
//       const method = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: 'PUT',
//         },
//       });

//       console.log("🔐 Method encrypted: PUT");

//       // Step 2: Prepare payload
//       const payload = {
//         project_charter_id: $variables.projectCharterVar.project_charter_id,
//         object_version_num: $variables.projectCharterVar.object_version_num,
//         project_title: $variables.projectCharterVar.project_title,
//         project_id: $variables.projectCharterVar.project_id,
//         parent_project_charter_id: $variables.projectCharterVar.parent_project_charter_id,
//         project_description: $variables.projectCharterVar.project_description,
//         ref_num: $variables.projectCharterVar.ref_num,
//         revision: $variables.projectCharterVar.revision,
//         region_id: $variables.projectCharterVar.region_id,
//         related_sons: $variables.projectCharterVar.related_sons,
//         project_number: $variables.projectCharterVar.project_number,
//         principle_purpose: $variables.projectCharterVar.principle_purpose,
//         other_purpose: $variables.projectCharterVar.other_purpose,
//         justification: $variables.projectCharterVar.justification,
//         main_feature: $variables.projectCharterVar.main_feature,
//         oper_philosophy: $variables.projectCharterVar.oper_philosophy,
//         capex_requirement: $variables.projectCharterVar.capex_requirement,
//         location_pl: $variables.projectCharterVar.location_pl,
//         service_req_obj: $variables.projectCharterVar.service_req_obj,
//         overview_project: $variables.projectCharterVar.overview_project,
//         project_owner: $variables.projectCharterVar.project_owner,
//         execution_director: $variables.projectCharterVar.execution_director,
//         design: $variables.projectCharterVar.design,
//         construction: $variables.projectCharterVar.construction,
//         testing_commissioning: $variables.projectCharterVar.testing_commissioning,
//         project_scope: $variables.projectCharterVar.project_scope,
//         project_objective: $variables.projectCharterVar.project_objective,
//         success_criteria: $variables.projectCharterVar.success_criteria,
//         strength: $variables.projectCharterVar.strength,
//         weakness: $variables.projectCharterVar.weakness,
//         opportunities: $variables.projectCharterVar.opportunities,
//         threats: $variables.projectCharterVar.threats,
//         hse_integration_req: $variables.projectCharterVar.hse_integration_req,
//         responsibilities: $variables.projectCharterVar.responsibilities,

//         // ✅ FORMAT DATES FOR ORACLE (YYYY-MM-DD)
//         design_date: this.formatDateForOracle($variables.projectCharterVar.design_date),
//         construction_date: this.formatDateForOracle($variables.projectCharterVar.construction_date),
//         testing_commissioning_date: this.formatDateForOracle($variables.projectCharterVar.testing_commissioning_date),
//         tender_award: this.formatDateForOracle($variables.projectCharterVar.tender_award),

//         estimated_capex_cost: $variables.projectCharterVar.estimated_capex_cost,
//         estimated_opex_cost: $variables.projectCharterVar.estimated_opex_cost,
//         procurement_assumption: $variables.projectCharterVar.procurement_assumption,
//         operating_principle: $variables.projectCharterVar.operating_principle,
//         approver_id: $variables.projectCharterVar.approver_id,
//         manager_status: $variables.projectCharterVar.manager_status,
//         wf_item_type: $variables.projectCharterVar.wf_item_type,
//         wf_item_key: $variables.projectCharterVar.wf_item_key,
//         status_id: $variables.projectCharterVar.status_id,
//         additional_info: $variables.projectCharterVar.additional_info,
//         last_updated_by: $application.user.email || 'CURRENT_USER',
//         last_updated_login: $application.user.email || 'CURRENT_USER'
//       };

//       console.log("📦 Update Payload prepared");

//       // Step 3: Encrypt payload
//       const encryptedPayload = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: payload,
//         },
//       });

//       console.log("🔐 Payload encrypted successfully");

//       // Step 4: Call ORDS endpoint
//       const response = await Actions.callRest(context, {
//         endpoint: 'PAM/postPmisProjectCharterProcess',
//         headers: {
//           'x-session-id': $variables.pNavId, // ✅ Use pNavId (already encrypted)
//           'x-session-code': method,
//         },
//         body: {
//           payload: encryptedPayload,
//         },
//       });

//       console.log("📥 ORDS Response:", response.body);

//       // Step 5: Check response
//       if (response.body.P_ERR_CODE === 'S') {
//         console.log("✅ Update successful");

//         // Increment object_version_num locally to match DB (DB does version + 1 on update)
//         $variables.projectCharterVar.object_version_num =
//           ($variables.projectCharterVar.object_version_num || 1) + 1;
//         console.log("📝 Object version incremented to:", $variables.projectCharterVar.object_version_num);

//         // Success notification
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Success',
//           message: 'Project Charter updated successfully',
//           type: 'confirmation',
//           displayMode: 'transient',
//         });

//         // Reload data to get fresh database values
//         await this.reloadPageData(context);

//       } else {
//         // Error from ORDS
//         console.error("❌ Update failed:", response.body.P_ERR_MSG);

//         await Actions.fireNotificationEvent(context, {
//           summary: 'Update Failed',
//           message: response.body.P_ERR_MSG || 'Failed to update Project Charter',
//           type: 'error',
//           displayMode: 'transient',
//         });
//       }
//     }

//     // ========== CREATE MODE - INSERT ==========
//     async createProjectCharter(context) {
//       const { $variables, $application } = context;

//       console.log("➕ CREATE MODE - Creating new Project Charter");

//       // Step 1: Encrypt key
//       const encryptedKey = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: '0',
//         },
//       });

//       console.log("🔐 Key encrypted: 0");

//       // Step 2: Encrypt method
//       const method = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: 'POST',
//         },
//       });

//       console.log("🔐 Method encrypted: POST");

//       // Step 3: Prepare payload
//       const payload = {
//         object_version_num: $variables.projectCharterVar.object_version_num,
//         project_title: $variables.projectCharterVar.project_title,
//         project_id: $variables.projectCharterVar.project_id,
//         parent_project_charter_id: $variables.projectCharterVar.parent_project_charter_id,
//         project_description: $variables.projectCharterVar.project_description,
//         revision: $variables.projectCharterVar.revision,
//         region_id: $variables.projectCharterVar.region_id,
//         related_sons: $variables.projectCharterVar.related_sons,
//         project_number: $variables.projectCharterVar.project_number,
//         principle_purpose: $variables.projectCharterVar.principle_purpose,
//         other_purpose: $variables.projectCharterVar.other_purpose,
//         justification: $variables.projectCharterVar.justification,
//         main_feature: $variables.projectCharterVar.main_feature,
//         oper_philosophy: $variables.projectCharterVar.oper_philosophy,
//         capex_requirement: $variables.projectCharterVar.capex_requirement,
//         location_pl: $variables.projectCharterVar.location_pl,
//         service_req_obj: $variables.projectCharterVar.service_req_obj,
//         overview_project: $variables.projectCharterVar.overview_project,
//         project_owner: $variables.projectCharterVar.project_owner,
//         execution_director: $variables.projectCharterVar.execution_director,
//         design: $variables.projectCharterVar.design,
//         construction: $variables.projectCharterVar.construction,
//         testing_commissioning: $variables.projectCharterVar.testing_commissioning,
//         project_scope: $variables.projectCharterVar.project_scope,
//         project_objective: $variables.projectCharterVar.project_objective,
//         success_criteria: $variables.projectCharterVar.success_criteria,
//         strength: $variables.projectCharterVar.strength,
//         weakness: $variables.projectCharterVar.weakness,
//         opportunities: $variables.projectCharterVar.opportunities,
//         threats: $variables.projectCharterVar.threats,
//         hse_integration_req: $variables.projectCharterVar.hse_integration_req,
//         responsibilities: $variables.projectCharterVar.responsibilities,

//         // ✅ FORMAT DATES FOR ORACLE (YYYY-MM-DD)
//         design_date: this.formatDateForOracle($variables.projectCharterVar.design_date),
//         construction_date: this.formatDateForOracle($variables.projectCharterVar.construction_date),
//         testing_commissioning_date: this.formatDateForOracle($variables.projectCharterVar.testing_commissioning_date),
//         tender_award: this.formatDateForOracle($variables.projectCharterVar.tender_award),

//         estimated_capex_cost: $variables.projectCharterVar.estimated_capex_cost,
//         estimated_opex_cost: $variables.projectCharterVar.estimated_opex_cost,
//         procurement_assumption: $variables.projectCharterVar.procurement_assumption,
//         operating_principle: $variables.projectCharterVar.operating_principle,
//         approver_id: $variables.projectCharterVar.approver_id,
//         manager_status: $variables.projectCharterVar.manager_status,
//         wf_item_type: $variables.projectCharterVar.wf_item_type,
//         wf_item_key: $variables.projectCharterVar.wf_item_key,
//         additional_info: $variables.projectCharterVar.additional_info,
//         created_by: $application.user.email || 'CURRENT_USER',
//         last_updated_by: $application.user.email || 'CURRENT_USER',
//         last_updated_login: $application.user.email || 'CURRENT_USER',
//       };

//       console.log("📦 Create Payload prepared");

//       // Step 4: Encrypt payload
//       const encryptedPayload = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: payload,
//         },
//       });

//       console.log("🔐 Payload encrypted successfully");

//       // Step 5: Call ORDS endpoint
//       const response = await Actions.callRest(context, {
//         endpoint: 'PAM/postPmisProjectCharterProcess',
//         headers: {
//           'x-session-id': encryptedKey,
//           'x-session-code': method,
//         },
//         body: {
//           payload: encryptedPayload,
//         },
//       });

//       console.log("📥 ORDS Response:", response.body);

//       // Step 6: Check response
//       if (response.body.P_ERR_CODE === 'S') {
//         console.log("✅ Create successful");

//         // ✅ Get encrypted ID from response header
//         const newProjectId = response.headers.get('X-Session-Id') 
//           || response.headers.get('x-session-id') 
//           || response.headers.get('X-session-id');
        
//         const newObjectVersion = response.body.object_version_num || 1;

//         console.log("🔑 New encrypted Project ID:", newProjectId);
//         console.log("📝 Object version:", newObjectVersion);

//         // Update object version
//         $variables.projectCharterVar.object_version_num = newObjectVersion;
//         $variables.projectCharterVar.project_number = response.body.project_number;

//         // ========== SWITCH TO EDIT MODE ==========
//         $variables.editMode = 'edit';
//         $variables.pNavCode = 'EDIT';
//         $variables.pNavId = newProjectId; // ✅ Store encrypted ID

//         console.log("🔄 Mode switched to EDIT");

//         // Success notification
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Success',
//           message: response.body.P_ERR_MSG || 'Project Charter created successfully',
//           type: 'confirmation',
//           displayMode: 'transient',
//         });

//         // Reload data to get fresh database values
//         await this.reloadPageData(context);

//       } else {
//         // Error from ORDS
//         console.error("❌ Create failed:", response.body.P_ERR_MSG);

//         await Actions.fireNotificationEvent(context, {
//           summary: 'Create Failed',
//           message: response.body.P_ERR_MSG || 'Failed to create Project Charter',
//           type: 'error',
//           displayMode: 'transient',
//         });
//       }
//     }

//     // ========== HELPER: Reload Page Data ==========
//     async reloadPageData(context) {
//       const { $variables } = context;

//       console.log("🔄 Reloading page data...");

//       try {
//         // Call vbAfterNavigateListener to reload all data
//         await Actions.callChain(context, {
//           chain: 'vbAfterNavigateListener',
//         });

//         console.log("✅ Page data reloaded successfully");

//       } catch (reloadError) {
//         console.error("⚠️ Error reloading page data:", reloadError);

//         // Show warning but don't fail the save
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Warning',
//           message: 'Data saved but failed to reload. Please refresh the page.',
//           type: 'warning',
//           displayMode: 'transient',
//         });
//       }
//     }

//   }

//   return saveAndCloseChain;
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

  class saveAndCloseChain extends ActionChain {

    /**
     * Main Save and Close - Saves Header + Child Tables Sequentially
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.isSaveAndNavigate
     */
    async run(context, { isSaveAndNavigate = 'N' }) {
      const { $page, $flow, $application, $variables } = context;

      // Open progress dialog
      await Actions.callComponentMethod(context, {
        selector: '#progressMsg',
        method: 'open',
      });

      try {
        // ========== STEP 1: VALIDATE MAIN FORM ==========
        const validationResult = await this.validateMainForm(context);
        
        if (!validationResult.isValid) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: validationResult.message,
            type: 'error',
            displayMode: 'transient',
          });
          return;
        }

        // ========== STEP 2: SAVE PROJECT CHARTER HEADER ==========
        if ($variables.editMode === 'edit') {
          // ========== EDIT MODE ==========
          await this.updateProjectCharter(context);
        } else {
          // ========== CREATE MODE ==========
          await this.createProjectCharter(context);
        }

        // ========== STEP 3: NAVIGATE OR STAY ==========
        if (isSaveAndNavigate === 'Y') {
          const toProjectchartesearch = await Actions.navigateToPage(context, {
            page: 'projectchartesearch',
          });
        }

      } catch (error) {
        console.error("❌ Error saving Project Charter:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Save Failed',
          message: error.message || 'An error occurred while saving',
          type: 'error',
          displayMode: 'persist',
        });

      } finally {
        // Close progress dialog
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'close',
        });
      }
    }

    // ========== HELPER: VALIDATE MAIN FORM ==========
    async validateMainForm(context) {
      const { $variables } = context;

      const requiredFields = [
        // { 
        //   field: 'region_id', label: 'Region' 
        // },
      ];

      for (const requirement of requiredFields) {
        const value = $variables.projectCharterVar[requirement.field];
        
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return {
            isValid: false,
            message: `${requirement.label} is required`
          };
        }
      }

      return { isValid: true };
    }

    // ========== HELPER: FORMAT DATE FOR ORACLE ==========
    formatDateForOracle(dateValue) {
      if (!dateValue) {
        return null;
      }

      try {
        let date;
        
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          date = new Date(dateValue);
        } else {
          console.warn("⚠️ Unexpected date type:", typeof dateValue);
          return null;
        }

        if (isNaN(date.getTime())) {
          console.warn("⚠️ Invalid date value:", dateValue);
          return null;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const formatted = `${year}-${month}-${day}`;
        console.log(`📅 Date formatted: ${dateValue} → ${formatted}`);
        
        return formatted;

      } catch (error) {
        console.error("❌ Error formatting date:", error);
        return null;
      }
    }

    // ========== EDIT MODE - UPDATE ==========
    async updateProjectCharter(context) {
      const { $variables, $application } = context;

      console.log("🔄 UPDATE MODE - Editing existing Project Charter");

      // Step 1: Encrypt method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PUT',
        },
      });

      console.log("🔐 Method encrypted: PUT");

      // Step 2: Prepare payload (CLOB fields excluded - saved separately via put_new_data)
      const payload = {
        project_charter_id: $variables.projectCharterVar.project_charter_id,
        object_version_num: $variables.projectCharterVar.object_version_num,
        project_title: $variables.projectCharterVar.project_title,
        project_id: $variables.projectCharterVar.project_id,
        parent_project_charter_id: $variables.projectCharterVar.parent_project_charter_id,
        project_description: $variables.projectCharterVar.project_description,
        ref_num: $variables.projectCharterVar.ref_num,
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
        status_id: $variables.projectCharterVar.status_id,
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_login: $application.user.email || 'CURRENT_USER'
      };

      console.log("📦 Update Payload prepared");

      // Step 3: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: payload,
        },
      });

      console.log("🔐 Payload encrypted successfully");

      // Step 4: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmisProjectCharterProcess',
        headers: {
          'x-session-id': $variables.pNavId, // ✅ Use pNavId (already encrypted)
          'x-session-code': method,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log("📥 ORDS Response:", response.body);

      // Step 5: Check response
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Update successful");

        $variables.projectCharterVar.object_version_num =
          ($variables.projectCharterVar.object_version_num || 0) + 1;

        await this.saveClobFields(context);

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Project Charter updated successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        await this.reloadPageData(context);

      } else {
        // Error from ORDS
        console.error("❌ Update failed:", response.body.P_ERR_MSG);

        await Actions.fireNotificationEvent(context, {
          summary: 'Update Failed',
          message: response.body.P_ERR_MSG || 'Failed to update Project Charter',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== CREATE MODE - INSERT ==========
    async createProjectCharter(context) {
      const { $variables, $application } = context;

      console.log("➕ CREATE MODE - Creating new Project Charter");

      // Step 1: Encrypt key
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      console.log("🔐 Key encrypted: 0");

      // Step 2: Encrypt method
      const method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'POST',
        },
      });

      console.log("🔐 Method encrypted: POST");

      // Step 3: Prepare payload (CLOB fields excluded - saved separately via put_new_data)
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

      console.log("📦 Create Payload prepared");

      // Step 4: Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: payload,
        },
      });

      console.log("🔐 Payload encrypted successfully");

      // Step 5: Call ORDS endpoint
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmisProjectCharterProcess',
        headers: {
          'x-session-id': encryptedKey,
          'x-session-code': method,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      console.log("📥 ORDS Response:", response.body);

      // Step 6: Check response
      if (response.body.P_ERR_CODE === 'S') {
        console.log("✅ Create successful");

        // ✅ Get encrypted ID from response header
        const newProjectId = response.headers.get('X-Session-Id') 
          || response.headers.get('x-session-id') 
          || response.headers.get('X-session-id');
        
        const newObjectVersion = response.body.object_version_num || 0;

        console.log("🔑 New encrypted Project ID:", newProjectId);
        console.log("📝 Object version:", newObjectVersion);

        // Update object version
        $variables.projectCharterVar.object_version_num = newObjectVersion;
        $variables.projectCharterVar.project_number = response.body.project_number;

        $variables.editMode = 'edit';
        $variables.pNavCode = 'EDIT';
        $variables.pNavId = newProjectId;

        await this.saveClobFields(context);

        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: response.body.P_ERR_MSG || 'Project Charter created successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        await this.reloadPageData(context);

      } else {
        // Error from ORDS
        console.error("❌ Create failed:", response.body.P_ERR_MSG);

        await Actions.fireNotificationEvent(context, {
          summary: 'Create Failed',
          message: response.body.P_ERR_MSG || 'Failed to create Project Charter',
          type: 'error',
          displayMode: 'transient',
        });
      }
    }

    // ========== HELPER: Save CLOB Fields via put_new_data ==========
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

    // ========== HELPER: Reload Page Data ==========
    async reloadPageData(context) {
      const { $variables } = context;

      console.log("🔄 Reloading page data...");

      try {
        // Call vbAfterNavigateListener to reload all data
        await Actions.callChain(context, {
          chain: 'vbAfterNavigateListener',
        });

        console.log("✅ Page data reloaded successfully");

      } catch (reloadError) {
        console.error("⚠️ Error reloading page data:", reloadError);

        // Show warning but don't fail the save
        await Actions.fireNotificationEvent(context, {
          summary: 'Warning',
          message: 'Data saved but failed to reload. Please refresh the page.',
          type: 'warning',
          displayMode: 'transient',
        });
      }
    }

  }

  return saveAndCloseChain;
});