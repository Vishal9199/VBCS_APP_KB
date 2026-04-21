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

  class TableBeforeRowEditEndChain extends ActionChain {

    /**
     * Helper function to format date to YYYY-MM-DD
     * @param {string} dateString - ISO 8601 date string or any date format
     * @returns {string|null} Formatted date or null
     */
    formatDateForOracle(dateString) {
      if (!dateString) return null;
      
      try {
        // Handle various date formats
        let dateStr = String(dateString).trim();
        
        // If already in YYYY-MM-DD format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        
        // Extract date part from ISO 8601 format (2024-12-15T00:00:00Z)
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
        }
        
        // Extract date from timestamp format (2024-12-15 00:00:00)
        if (dateStr.includes(' ')) {
          dateStr = dateStr.split(' ')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }
        }
        
        // Fallback: parse as Date object
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Date formatting error:", error, "Input:", dateString);
        return null;
      }
    }

    /**
     * @param {Object} context
     * @param {Object} params
     */
    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (cancelEdit) {
        console.log("TableBeforeRowEditEnd - Edit cancelled");
        return;
      }

      // Validate required fields
      if (!updatedRow.milestone_id) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: 'Milestone is required',
          type: 'warning',
          displayMode: 'transient'
        });
        return;
      }

      if (!updatedRow.planned_start_date) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: 'Planned Start Date is required',
          type: 'error',
          displayMode: 'transient'
        });
        return;
      }

      if (!updatedRow.planned_end_date) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: 'Planned End Date is required',
          type: 'error',
          displayMode: 'transient'
        });
        return;
      }

      // Date validations
      const plannedStart = new Date(updatedRow.planned_start_date);
      const plannedEnd = new Date(updatedRow.planned_end_date);
      
      if (plannedEnd < plannedStart) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: 'Planned End Date must be greater than or equal to Planned Start Date',
          type: 'error',
          displayMode: 'transient'
        });
        return;
      }

      // Validate revised dates
      if (updatedRow.revised_start_date && updatedRow.revised_end_date) {
        const revisedStart = new Date(updatedRow.revised_start_date);
        const revisedEnd = new Date(updatedRow.revised_end_date);
        
        if (revisedEnd < revisedStart) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Revised End Date must be greater than or equal to Revised Start Date',
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }
      }

      // Validate actual dates
      if (updatedRow.actual_start_date && updatedRow.actual_end_date) {
        const actualStart = new Date(updatedRow.actual_start_date);
        const actualEnd = new Date(updatedRow.actual_end_date);
        
        if (actualEnd < actualStart) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: 'Actual End Date must be greater than or equal to Actual Start Date',
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }
      }

      // Update milestone text
      if (updatedRow.milestone_id !== rowData.milestone_id) {
        console.log("Milestone changed from", rowData.milestone_id, "to", updatedRow.milestone_id);
        
        let milestoneFound = false;
        let newMilestoneName = updatedRow.project_milestone;
        let newMilestoneCode = updatedRow.milestone_code;
        
        // Try ServiceDataProvider first
        try {
          const result = await $variables.milestoneListSDP.fetchByKeys({ 
            keys: new Set([updatedRow.milestone_id]) 
          });
          
          if (result && result.results && result.results.size > 0) {
            const milestoneEntry = result.results.get(updatedRow.milestone_id);
            if (milestoneEntry && milestoneEntry.data) {
              newMilestoneName = milestoneEntry.data.lookup_value_name;
              newMilestoneCode = milestoneEntry.data.lookup_value_code || updatedRow.milestone_code;
              milestoneFound = true;
              console.log("Milestone found from SDP:", milestoneEntry.data);
            }
          }
        } catch (error) {
          console.warn("SDP fetch failed:", error);
        }
        
        // Fallback to fetchedMilestoneListADP
        if (!milestoneFound && $variables.fetchedMilestoneListADP && $variables.fetchedMilestoneListADP.data) {
          try {
            const milestoneData = $variables.fetchedMilestoneListADP.data;
            
            if (milestoneData && Array.isArray(milestoneData)) {
              console.log("Searching in fetchedMilestoneListADP, data count:", milestoneData.length);
              
              let selectedMilestone = milestoneData.find(m => m.lookup_value_id === updatedRow.milestone_id);
              
              if (!selectedMilestone) {
                selectedMilestone = milestoneData.find(m => m.milestone_id === updatedRow.milestone_id);
              }
              
              if (selectedMilestone) {
                newMilestoneName = selectedMilestone.lookup_value_name || selectedMilestone.project_milestone;
                newMilestoneCode = selectedMilestone.lookup_value_code || selectedMilestone.milestone_code || updatedRow.milestone_code;
                console.log("Found milestone from ADP:", selectedMilestone);
              } else {
                console.warn("Milestone not found for ID:", updatedRow.milestone_id);
              }
            }
          } catch (error) {
            console.warn("ADP search failed:", error);
          }
        }

        // FIX: Create new object instead of direct mutation
        updatedRow = {
          ...updatedRow,
          project_milestone: newMilestoneName,
          milestone_code: newMilestoneCode
        };
        console.log("Milestone updated successfully");
      }

      // ============================================
      // FIX: Format dates to YYYY-MM-DD for Oracle
      // ============================================
      const formattedRow = {
        ...updatedRow,
        planned_start_date: this.formatDateForOracle(updatedRow.planned_start_date),
        planned_end_date: this.formatDateForOracle(updatedRow.planned_end_date),
        revised_start_date: this.formatDateForOracle(updatedRow.revised_start_date),
        revised_end_date: this.formatDateForOracle(updatedRow.revised_end_date),
        actual_start_date: this.formatDateForOracle(updatedRow.actual_start_date),
        actual_end_date: this.formatDateForOracle(updatedRow.actual_end_date)
      };

      console.log("Original dates:", {
        planned_start: updatedRow.planned_start_date,
        planned_end: updatedRow.planned_end_date
      });
      console.log("Formatted dates:", {
        planned_start: formattedRow.planned_start_date,
        planned_end: formattedRow.planned_end_date
      });

      // Update item in BufferingDataProvider with formattedRow directly
      console.log("Updating BufferingDataProvider...");
      console.log("Update Key:", rowKey);
      console.log("Updated Data:", JSON.stringify(formattedRow));
      
      try {
        const updateItem = await $page.variables.bufferDPSchedule.instance.updateItem({
          metadata: {
            key: rowKey,
          },
          data: formattedRow,  // Use formattedRow directly, not lvCurrentRow
        });

        console.log("BufferingDataProvider update successful");
        console.log("TableBeforeRowEditEnd - Item updated:", JSON.stringify(formattedRow));
        
        // Now update lvCurrentRow for any other dependencies
        await Actions.assignVariable(context, {
          variable: '$page.variables.lvCurrentRow',
          value: formattedRow,
          auto: 'always',
          reset: 'empty'
        });
      } catch (error) {
        console.error("BufferingDataProvider update failed:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Update Error',
          message: 'Failed to update the row: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return TableBeforeRowEditEndChain;
});