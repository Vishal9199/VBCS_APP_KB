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

  class loadBudgetCostDataAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {number} params.projectId
     * @param {number} params.calendarId
     * Loads existing budget cost data for the selected project and calendar
     * Called after save operation and when calendar changes
     */
    async run(context, { projectId, calendarId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log('Loading budget cost data for Project:', projectId, 'Calendar:', calendarId);

        if (!projectId || !calendarId) {
          console.log('Missing projectId or calendarId, cannot load budget data');
          return;
        }

        // Encrypt IDs for API call
        let enc_project_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: projectId,
          },
        });

        let enc_calendar_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: calendarId,
          },
        });

        // Call REST endpoint to get budget cost data
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/getPmispamMasterplanLinebudgetcostGetbyid',
          headers: {
            'x-session-id': enc_project_id,
            // 'x-session-cache': enc_calendar_id,
          },
        });

        // Check if data was retrieved successfully
        if (response.ok && response.body && response.body.items && response.body.items.length > 0) {
          const budgetData = response.body.items[0];
          console.log('Budget cost data loaded successfully:', budgetData);

          // Update budgetCostLineVar with retrieved data
          // Preserve year_prompt fields and merge with retrieved values
          $variables.budgetCostLineVar = {
            ...$variables.budgetCostLineVar,  // Keep existing year_prompt1-7
            budget_cost_id: budgetData.budget_cost_id || null,
            project_id: budgetData.project_id || projectId,
            budget_year_id: budgetData.budget_year_id || calendarId,
            year_value1: budgetData.year_value1 || 0,
            year_value2: budgetData.year_value2 || 0,
            year_value3: budgetData.year_value3 || 0,
            year_value4: budgetData.year_value4 || 0,
            year_value5: budgetData.year_value5 || 0,
            year_value6: budgetData.year_value6 || 0,
            year_value7: budgetData.year_value7 || 0,
            additional_info: budgetData.additional_info || '',
            created_by: budgetData.created_by || null,
            creation_date: budgetData.creation_date || null,
            last_updated_by: budgetData.last_updated_by || null,
            last_update_date: budgetData.last_update_date || null,
            last_update_login: budgetData.last_update_login || null,
            object_version_num: budgetData.object_version_num || null,
          };

          console.log('Budget values loaded into form:', {
            year_value1: $variables.budgetCostLineVar.year_value1,
            year_value2: $variables.budgetCostLineVar.year_value2,
            year_value3: $variables.budgetCostLineVar.year_value3,
            year_value4: $variables.budgetCostLineVar.year_value4,
            year_value5: $variables.budgetCostLineVar.year_value5,
            year_value6: $variables.budgetCostLineVar.year_value6,
            year_value7: $variables.budgetCostLineVar.year_value7,
          });

          // Clear validation message since we loaded valid data
          $variables.budgetValidationMessage = '';

        } else {
          // No existing budget data found - this is first time (POST scenario)
          console.log('No existing budget cost data found - ready for new entry (POST)');
          
          // Clear budget values but keep year_prompts and IDs
          $variables.budgetCostLineVar = {
            ...$variables.budgetCostLineVar,
            budget_cost_id: null,
            project_id: projectId,
            budget_year_id: calendarId,
            year_value1: 0,
            year_value2: 0,
            year_value3: 0,
            year_value4: 0,
            year_value5: 0,
            year_value6: 0,
            year_value7: 0,
            additional_info: '',
            object_version_num: null,
          };

          console.log('Budget form ready for new entry');
        }

      } catch (error) {
        console.error('Error loading budget cost data:', error);
        
        // On error, clear budget values to prevent showing stale data
        $variables.budgetCostLineVar = {
          ...$variables.budgetCostLineVar,
          budget_cost_id: null,
          year_value1: 0,
          year_value2: 0,
          year_value3: 0,
          year_value4: 0,
          year_value5: 0,
          year_value6: 0,
          year_value7: 0,
          additional_info: '',
          object_version_num: null,
        };

        // Show error notification only if it's not a "not found" scenario
        if (error.status !== 404) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Failed to load budget cost data: ' + (error.message || 'Unknown error'),
            displayMode: 'transient',
            type: 'error',
          });
        }
      }
    }
  }

  return loadBudgetCostDataAC;
});