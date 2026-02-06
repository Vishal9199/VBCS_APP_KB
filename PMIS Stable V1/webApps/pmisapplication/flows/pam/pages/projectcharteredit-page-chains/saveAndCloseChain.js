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
        const headerResult = await this.saveProjectCharterHeader(context);
        
        if (!headerResult.success) {
          throw new Error(headerResult.message || 'Failed to save Project Charter header');
        }

        // ========== STEP 3: CAPTURE RESPONSE & UPDATE MODE ==========
        const projectCharterId = headerResult.project_charter_id;
        
        if ($variables.editMode === 'add' && projectCharterId) {
          console.log("🔄 Switching from ADD to EDIT mode");
          
          // Update local variable
          $variables.projectCharterVar.project_charter_id = projectCharterId;
          
          // Switch to EDIT mode
          $variables.editMode = 'edit';
          $variables.pNavCode = 'EDIT';
          $variables.pNavId = projectCharterId;
          
          // Update object version if returned
          if (headerResult.object_version_num) {
            $variables.projectCharterVar.object_version_num = headerResult.object_version_num;
          }
        }

        // // ========== STEP 4: (LINES) SAVE ESTIMATE COSTS ==========
        // const costResult = await this.saveEstimateCosts(context, projectCharterId);
        
        // if (!costResult.success) {
        //   console.warn("⚠️ Estimate Costs save had issues:", costResult.message);
        // }

        // // ========== STEP 5: (LINES) SAVE MAJOR RISKS ==========
        // const riskResult = await this.saveMajorRisks(context, projectCharterId);
        
        // if (!riskResult.success) {
        //   console.warn("⚠️ Major Risks save had issues:", riskResult.message);
        // }

        // ========== STEP 6: SUCCESS - NAVIGATE BACK ==========
        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Project Charter saved successfully',
          type: 'confirmation',
          displayMode: 'transient',
        });

        if(isSaveAndNavigate === 'Y') {
          await Actions.navigateToPage(context, {
            page: 'projectcharterlist',
          });
        }
        else{
          console.log("Saved + Stay inside edit page");
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
        { field: 'ref_num', label: 'Reference Number' },
        { field: 'region_id', label: 'Region' },
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
        
        // Handle different date input types
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          date = new Date(dateValue);
        } else {
          return null;
        }

        // Check if valid date
        if (isNaN(date.getTime())) {
          return null;
        }

        // Format as YYYY-MM-DD (Oracle-friendly format)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;

      } catch (error) {
        console.error("Error formatting date:", error);
        return null;
      }
    }

    // ========== SAVE PROJECT CHARTER HEADER (WITH DATE FORMATTING) ==========
    async saveProjectCharterHeader(context) {
      const { $variables, $application } = context;

      try {
        const isNewRecord = $variables.editMode === 'add';
        const methodStr = isNewRecord ? 'POST' : 'PUT';
        
        console.log(`${isNewRecord ? '➕ CREATE' : '🔄 UPDATE'} MODE - Project Charter Header`);

        // ========== STEP 1: ENCRYPT KEY ==========
        const keyToEncrypt = isNewRecord 
          ? '0' 
          : String($variables.projectCharterVar.project_charter_id || '0');
        
        const encryptedKey = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: keyToEncrypt,
          },
        });

        console.log("🔐 Key encrypted");

        // ========== STEP 2: ENCRYPT METHOD ==========
        const encryptedMethod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: methodStr,
          },
        });

        console.log(`🔐 Method encrypted: ${methodStr}`);

        // ========== STEP 3: PREPARE PAYLOAD WITH FORMATTED DATES ==========
        const payload = {
          project_charter_id: $variables.projectCharterVar.project_charter_id,
          object_version_num: $variables.projectCharterVar.object_version_num,
          project_id: $variables.projectCharterVar.project_id,
          ref_num: $variables.projectCharterVar.ref_num,
          region_id: $variables.projectCharterVar.region_id,
          related_sons: $variables.projectCharterVar.related_sons,
          budget_number: $variables.projectCharterVar.budget_number,
          principle_purpose: $variables.projectCharterVar.principle_purpose,
          other_purpose: $variables.projectCharterVar.other_purpose,
          justification: $variables.projectCharterVar.justification,
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
          
          // ✅ FORMAT DATES FOR ORACLE (YYYY-MM-DD)
          design_date: this.formatDateForOracle($variables.projectCharterVar.design_date),
          construction_date: this.formatDateForOracle($variables.projectCharterVar.construction_date),
          testing_commissioning_date: this.formatDateForOracle($variables.projectCharterVar.testing_commissioning_date),
          tender_award: this.formatDateForOracle($variables.projectCharterVar.tender_award),
          
          estimated_capex_cost: $variables.projectCharterVar.estimated_capex_cost,
          estimated_opex_cost: $variables.projectCharterVar.estimated_opex_cost,
          procurement_assumption: $variables.projectCharterVar.procurement_assumption,
          operating_principle: $variables.projectCharterVar.operating_principle,
          manager_status: $variables.projectCharterVar.manager_status,
          wf_item_type: $variables.projectCharterVar.wf_item_type,
          wf_item_key: $variables.projectCharterVar.wf_item_key,
          status_id: $variables.projectCharterVar.status_id,
          additional_info: $variables.projectCharterVar.additional_info,
          created_by: isNewRecord ? ($application.user.email || 'CURRENT_USER') : $variables.projectCharterVar.created_by,
          last_updated_by: $application.user.email || 'CURRENT_USER',
          last_updated_login: $application.user.email || 'CURRENT_USER',
        };

        console.log("📦 Payload prepared with formatted dates:", {
          design_date: payload.design_date,
          construction_date: payload.construction_date,
          testing_commissioning_date: payload.testing_commissioning_date,
          tender_award: payload.tender_award
        });

        // ========== STEP 4: ENCRYPT PAYLOAD ==========
        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: payload,
          },
        });

        console.log("🔐 Payload encrypted");

        // ========== STEP 5: CALL ORDS ENDPOINT ==========
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmisProjectCharterProcess',
          headers: {
            'x-session-id': encryptedKey,
            'x-session-code': encryptedMethod,
          },
          body: {
            payload: encryptedPayload,
          },
        });

        console.log("📥 ORDS Response:", response.body);

        // ========== STEP 6: CHECK RESPONSE ==========
        if (response.body.P_ERR_CODE === 'S') {
          console.log("✅ Header save successful");

          const newEncryptedId = response.headers.get('X-Session-Id') || 
                                 response.headers.get('x-session-id') ||
                                 response.headers.get('X-session-id');

          const newObjectVersion = response.body.object_version_num || 
                                   ($variables.projectCharterVar.object_version_num + 1);

          return {
            success: true,
            project_charter_id: newEncryptedId,
            object_version_num: newObjectVersion,
            message: response.body.p_err_msg || 'Header saved successfully'
          };

        } else {
          console.error("❌ Header save failed:", response.body.p_err_msg);
          
          return {
            success: false,
            message: response.body.p_err_msg || 'Unknown error saving header'
          };
        }

      } catch (error) {
        console.error("❌ Error in saveProjectCharterHeader:", error);
        return {
          success: false,
          message: error.message || 'Failed to save header'
        };
      }
    }

    // ========== SAVE ESTIMATE COSTS ==========
// ========== SAVE ESTIMATE COSTS (WITH ENHANCED ERROR LOGGING) ==========(Handled in the line area)
// async saveEstimateCosts(context, encryptedParentId) {
//   const { $variables, $application } = context;

//   try {
//     console.log("💰 Saving Estimate Costs...");

//     const costData = $variables.ADPestimateCost.data || [];
//     console.log('💰 Cost Data Structure:', JSON.stringify(costData, null, 2));
    
//     if (costData.length === 0) {
//       console.log("ℹ️ No Estimate Costs to save");
//       return { success: true, message: 'No costs to save' };
//     }

//     console.log("💰 Total Costs to Process:", costData.length);
//     console.log("💰 Cost Data Structure:", JSON.stringify(costData, null, 2));

//     let successCount = 0;
//     let failCount = 0;
//     const errors = [];

//     for (let i = 0; i < costData.length; i++) {
//       const cost = costData[i];
      
//       try {
//         const isNew = !cost.est_cost_id || cost.est_cost_id < 0;
//         const methodStr = isNew ? 'POST' : 'PUT';

//         console.log(`💰 [${i + 1}/${costData.length}] ${isNew ? 'Adding' : 'Updating'} Cost:`, {
//           est_cost_id: cost.est_cost_id,
//           est_capax_cost: cost.est_capax_cost,    //  Matches database
//           capax_unit: cost.capax_unit,            //  Matches database
//           est_opex_cost: cost.est_opex_cost,      //  Matches database
//           opex_unit: cost.opex_unit               //  Matches database
//         });

//         // Encrypt key
//         const keyToEncrypt = isNew ? '0' : String(cost.est_cost_id);
//         const encryptedKey = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: { input: keyToEncrypt },
//         });

//         // Encrypt method
//         const encryptedMethod = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: { input: methodStr },
//         });

//         // Prepare payload
//         const costPayload = {
//           est_cost_id: isNew ? 0 : cost.est_cost_id,
//             object_version_num: cost.object_version_num || 1,
//             project_charter_id: $variables.projectCharterVar.project_charter_id,
//             est_capax_cost: cost.est_capax_cost,      //  CORRECT FIELD
//             capax_unit: cost.capax_unit,              //  CORRECT FIELD
//             est_opex_cost: cost.est_opex_cost,        //  CORRECT FIELD
//             opex_unit: cost.opex_unit,                //  CORRECT FIELD
//             ref_num: cost.ref_num,
//             additional_info: cost.additional_info,
//             created_by: cost.created_by || $application.user.email,
//             last_updated_by: $application.user.email,
//             last_updated_login: $application.user.email
//         };

//         console.log(`💰 Cost Payload [${i + 1}]:`, JSON.stringify(costPayload, null, 2));

//         // Encrypt payload
//         const encryptedPayload = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: { input: costPayload },
//         });

//         // Call ORDS
//         const response = await Actions.callRest(context, {
//           endpoint: 'PAM/postPmispamProjectcharterEstcostProcess',
//           headers: {
//             'x-session-id': encryptedKey,
//             'x-session-code': encryptedMethod,
//           },
//           body: { payload: encryptedPayload },
//         });

//         console.log(`💰 Cost Response [${i + 1}]:`, response.body);

//         if (response.body.P_ERR_CODE === 'S') {
//           console.log(`✅ Cost [${i + 1}] saved: ${cost.cost_element_name || 'N/A'}`);
          
//           // Update object version locally
//           if (response.body.object_version_num) {
//             cost.object_version_num = response.body.object_version_num;
//           }
          
//           successCount++;
//         } else {
//           const errorMsg = response.body.P_ERR_MSG || response.body.p_err_msg || 'Unknown error';
//           console.error(`❌ Cost [${i + 1}] save failed:`, errorMsg);
//           errors.push(`Cost ${i + 1}: ${errorMsg}`);
//           failCount++;
//         }

//       } catch (costError) {
//         console.error(`❌ Error saving cost [${i + 1}]:`, costError);
//         errors.push(`Cost ${i + 1}: ${costError.message}`);
//         failCount++;
//       }
//     }

//     console.log(`💰 Estimate Costs Summary: ${successCount} success, ${failCount} failed`);
    
//     if (errors.length > 0) {
//       console.error("💰 Cost Errors:", errors);
//     }

//     return {
//       success: failCount === 0,
//       message: `Saved ${successCount}/${costData.length} estimate costs${errors.length > 0 ? '. Errors: ' + errors.join('; ') : ''}`
//     };

//   } catch (error) {
//     console.error("❌ Error in saveEstimateCosts:", error);
//     return {
//       success: false,
//       message: error.message || 'Failed to save estimate costs'
//     };
//   }
// }

// ========== SAVE MAJOR RISKS (WITH ENHANCED ERROR LOGGING) ==========(Handled in the line area)
// async saveMajorRisks(context, encryptedParentId) {
//   const { $variables, $application } = context;

//   try {
//     console.log("⚠️ Saving Major Risks...");

//     const riskData = $variables.ADPmajorRisk.data || [];
    
//     if (riskData.length === 0) {
//       console.log("ℹ️ No Major Risks to save");
//       return { success: true, message: 'No risks to save' };
//     }

//     console.log("⚠️ Total Risks to Process:", riskData.length);
//     console.log("⚠️ Risk Data Structure:", JSON.stringify(riskData, null, 2));

//     let successCount = 0;
//     let failCount = 0;
//     const errors = [];

//     for (let i = 0; i < riskData.length; i++) {
//       const risk = riskData[i];
      
//       try {
//         const isNew = !risk.risk_id || risk.risk_id < 0;
//         const methodStr = isNew ? 'POST' : 'PUT';

//         console.log(`⚠️ [${i + 1}/${riskData.length}] ${isNew ? 'Adding' : 'Updating'} Risk:`, {
//           risk_id: risk.risk_id,
//           risk_title: risk.risk_title,
//           mitigation: risk.mitigation
//         });

//         // Encrypt key
//         const keyToEncrypt = isNew ? '0' : String(risk.risk_id);
//         const encryptedKey = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: { input: keyToEncrypt },
//         });

//         // Encrypt method
//         const encryptedMethod = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: { input: methodStr },
//         });

//         // Prepare payload
//         const riskPayload = {
//           major_risk_id: isNew ? 0 : risk.major_risk_id,
//           object_version_num: risk.object_version_num || 1,
//           project_charter_id: $variables.projectCharterVar.project_charter_id,
//           major_risk_title: risk.major_risk_title,   // ✅ CORRECT FIELD
//           description: risk.description,
//           impact: risk.impact,
//           mitigation: risk.mitigation,               // ✅ CORRECT FIELD (not mitigation_plan)
//           ref_num: risk.ref_num,
//           additional_info: risk.additional_info,
//           created_by: risk.created_by || $application.user.email,
//           last_updated_by: $application.user.email,
//           last_updated_login: $application.user.email
//         };

//         console.log(`⚠️ Risk Payload [${i + 1}]:`, JSON.stringify(riskPayload, null, 2));

//         // Encrypt payload
//         const encryptedPayload = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: { input: riskPayload },
//         });

//         // Call ORDS
//         const response = await Actions.callRest(context, {
//           endpoint: 'PAM/postPmispamProjectcharterRiskProcess',
//           headers: {
//             'x-session-id': encryptedKey,
//             'x-session-code': encryptedMethod,
//           },
//           body: { payload: encryptedPayload },
//         });

//         console.log(`⚠️ Risk Response [${i + 1}]:`, response.body);

//         if (response.body.P_ERR_CODE === 'S') {
//           console.log(`✅ Risk [${i + 1}] saved: ${risk.risk_title || 'N/A'}`);
          
//           // Update object version locally
//           if (response.body.object_version_num) {
//             risk.object_version_num = response.body.object_version_num;
//           }
          
//           successCount++;
//         } else {
//           const errorMsg = response.body.P_ERR_MSG || response.body.p_err_msg || 'Unknown error';
//           console.error(`❌ Risk [${i + 1}] save failed:`, errorMsg);
//           errors.push(`Risk ${i + 1}: ${errorMsg}`);
//           failCount++;
//         }

//       } catch (riskError) {
//         console.error(`❌ Error saving risk [${i + 1}]:`, riskError);
//         errors.push(`Risk ${i + 1}: ${riskError.message}`);
//         failCount++;
//       }
//     }

//     console.log(`⚠️ Major Risks Summary: ${successCount} success, ${failCount} failed`);
    
//     if (errors.length > 0) {
//       console.error("⚠️ Risk Errors:", errors);
//     }

//     return {
//       success: failCount === 0,
//       message: `Saved ${successCount}/${riskData.length} major risks${errors.length > 0 ? '. Errors: ' + errors.join('; ') : ''}`
//     };

//   } catch (error) {
//     console.error("❌ Error in saveMajorRisks:", error);
//     return {
//       success: false,
//       message: error.message || 'Failed to save major risks'
//     };
//   }
// }
  }

  return saveAndCloseChain;
});