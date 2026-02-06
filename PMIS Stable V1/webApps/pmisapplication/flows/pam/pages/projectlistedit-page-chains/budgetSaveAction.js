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

  class budgetSaveAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        const budgetVar = $variables.budgetCostLineVar;

        // ================================================================
        // STEP 1: VALIDATION - Ensure at least one year field has value > 0
        // ================================================================
        const hasValue = budgetVar.year_value1 > 0 || 
                        budgetVar.year_value2 > 0 || 
                        budgetVar.year_value3 > 0 || 
                        budgetVar.year_value4 > 0 || 
                        budgetVar.year_value5 > 0 || 
                        budgetVar.year_value6 > 0 || 
                        budgetVar.year_value7 > 0;

        if (!hasValue) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Please enter a budget value for at least one year range',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // ================================================================
        // STEP 2: SHOW PROGRESS DIALOG
        // ================================================================
        // Uncomment if you have progress dialog configured
        // document.getElementById('progressMsg')?.open();

        // ================================================================
        // STEP 3: DETERMINE CREATE OR EDIT MODE
        // ================================================================
        const pNavCode = $page.variables.pNavCode || 'CREATE';
        const pNavId = $page.variables.pNavId || '0';
        const isEditMode = (pNavCode === 'EDIT' && budgetVar.budget_cost_id);
        const httpMethod = isEditMode ? 'PUT' : 'POST';
        const currentUser = $application.user.username || 'SYSTEM';

        console.log('='.repeat(80));
        console.log('BUDGET COST LINE SAVE OPERATION');
        console.log('Mode:', isEditMode ? 'EDIT (PUT)' : 'CREATE (POST)');
        console.log('Project ID:', $variables.masterPlanHeaderVar.project_id);
        console.log('Budget Year ID:', $variables.masterPlanHeaderVar.budget_year_id);
        console.log('User:', currentUser);
        console.log('='.repeat(80));

        // ================================================================
        // STEP 4: PREPARE PAYLOAD
        // ================================================================
        const calendarId = $variables.masterPlanHeaderVar.budget_year_id;
        
        const budgetPayload = {
          budget_cost_id: budgetVar.budget_cost_id || 0,
          object_version_num: budgetVar.object_version_num || 1,
          project_id: $variables.masterPlanHeaderVar.project_id,
          budget_year_id: calendarId,
          year_prompt1: budgetVar.year_prompt1 || '',
          year_value1: budgetVar.year_value1 || 0,
          year_prompt2: budgetVar.year_prompt2 || '',
          year_value2: budgetVar.year_value2 || 0,
          year_prompt3: budgetVar.year_prompt3 || '',
          year_value3: budgetVar.year_value3 || 0,
          year_prompt4: budgetVar.year_prompt4 || '',
          year_value4: budgetVar.year_value4 || 0,
          year_prompt5: budgetVar.year_prompt5 || '',
          year_value5: budgetVar.year_value5 || 0,
          year_prompt6: budgetVar.year_prompt6 || '',
          year_value6: budgetVar.year_value6 || 0,
          year_prompt7: budgetVar.year_prompt7 || '',
          year_value7: budgetVar.year_value7 || 0,
          additional_info: budgetVar.additional_info || '',
          created_by: $application.user.email,
          last_updated_by: $application.user.email,
          last_updated_login: $application.user.email,
          created_date: $application.functions.getSysdate,
          last_updated_date: $application.functions.getSysdate
        };

        console.log('Payload to save:', JSON.stringify(budgetPayload, null, 2));

        // ================================================================
        // STEP 5: ENCRYPT PAYLOAD
        // ================================================================
        console.log('Encrypting payload...');
        const encryptedPayloadResult = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: budgetPayload,
          },
        });

        console.log('✓ Payload encrypted successfully');

        // ================================================================
        // STEP 6: ENCRYPT METHOD
        // ================================================================
        console.log('Encrypting HTTP method:', httpMethod);
        const encryptedMethodResult = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: httpMethod,
          },
        });

        console.log('✓ Method encrypted successfully');

        // ================================================================
        // STEP 7: ENCRYPT PRIMARY KEY
        // ================================================================
        let encryptedPrimaryKey;
        
        if (isEditMode) {
          // For edit mode, use the existing budget_cost_id
          const pkResult = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: budgetVar.budget_cost_id.toString(),
            },
          });
          encryptedPrimaryKey = pkResult;
          console.log('✓ EDIT mode - budget_cost_id encrypted');
        } else {
          // For create mode, use '0'
          const pkResult = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: '0',
            },
          });
          encryptedPrimaryKey = pkResult;
          console.log('✓ CREATE mode - primary key encrypted as "0"');
        }

        // ================================================================
        // STEP 8: CALL REST API ENDPOINT
        // ================================================================
        console.log('Calling postPmispamBudgetlinecostProcess endpoint...');
        
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamBudgetlinecostProcess',
          headers: {
            'x-session-code': encryptedMethodResult,
            'x-session-id': encryptedPrimaryKey,
          },
          body: {
            "payload": encryptedPayloadResult
          },
        });

        // ================================================================
        // STEP 9: HANDLE API RESPONSE
        // ================================================================
        console.log('='.repeat(80));
        console.log('API RESPONSE');
        console.log('Status:', response.status);
        console.log('Response Body:', JSON.stringify(response.body, null, 2));
        console.log('='.repeat(80));

        // Close progress dialog
        // document.getElementById('progressMsg')?.close();

        // Check for errors in response
        const errorCode = response.body?.P_ERR_CODE || response.body?.p_err_code;
        const errorMsg = response.body?.P_ERR_MSG || response.body?.p_err_msg;

        if (errorCode && errorCode !== '0' && errorCode !== 'S') {
          // API returned an error
          console.error('API Error:', errorCode, errorMsg);
          await Actions.fireNotificationEvent(context, {
            summary: 'Save Failed',
            message: errorMsg || 'Failed to save budget allocation. Please try again.',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // ================================================================
        // STEP 10: SUCCESS - REFRESH DATA AND SHOW MESSAGE
        // ================================================================
        console.log('✓ Budget allocation saved successfully!');

        // Refresh the budget cost lines table
        // await Actions.callChain(context, {
        //   chain: 'budgetRefreshAction',
        // });

        await Actions.callChain(context, {
          chain: 'loadBudgetCostDataAC',
          params: {
            calendarId: $variables.masterPlanHeaderVar.budget_year_id,
            projectId: $variables.masterPlanHeaderVar.project_id,
          },
        });

        // // Clear the form
        // await Actions.callChain(context, {
        //   chain: 'budgetClearAction',
        // });

        // Show success message
        await Actions.fireNotificationEvent(context, {
          summary: 'Success',
          message: 'Budget allocation saved successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });

        console.log('='.repeat(80));
        console.log('SAVE OPERATION COMPLETED SUCCESSFULLY');
        console.log('='.repeat(80));

      } catch (error) {
        // ================================================================
        // ERROR HANDLING
        // ================================================================
        console.error('='.repeat(80));
        console.error('ERROR IN SAVE OPERATION');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('='.repeat(80));

        // Close progress dialog
        // document.getElementById('progressMsg')?.close();

        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to save budget allocation: ' + (error.message || 'Unknown error'),
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return budgetSaveAction;
});