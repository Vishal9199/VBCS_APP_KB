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

  class onClickSaveBudget extends ActionChain {

    /**
     * Called when "Save Budget" button is clicked.
     * Iterates all modified rows and calls PUT for each.
     * Endpoint: postPmispddBudgetcontrollinesProcess
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Get all pending changes from the buffer
      const submittableItems = await $page.variables.bufferDPBudgetLines.instance.getSubmittableItems();
      const updatedItems     = submittableItems.filter(obj => obj.operation === 'update');

      console.log('Budget Save - updated items count:', updatedItems.length);

      if (updatedItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes to save.',
          displayMode: 'transient',
        });
        $variables.lvBudgetEditMode = false;
        return;
      }

      $variables.lvBudgetIsSaving = true;

      // Mark all as submitting
      submittableItems.forEach((editItem) => {
        $page.variables.bufferDPBudgetLines.instance.setItemStatus(editItem, 'submitting');
      });

      let hasError = false;

      try {
        // Open progress dialog if present
        const dlg = document.getElementById('progressDialog');
        if (dlg) dlg.open();

        // Loop through each updated row serially
        await ActionUtils.forEach(updatedItems, async (item, index) => {

          const lineData = updatedItems[index].item.data;
          const lineId   = updatedItems[index].item.metadata.key;

          console.log('Saving line ID:', lineId, '| Data:', JSON.stringify(lineData));

          // Build payload matching NWS_PMIS_PDD_BUDGET_CTRL_LINES_PKG.put_data
          const payload = {
            object_version_num:       lineData.object_version_num,
            budget_control_header_id: lineData.budget_control_header_id,
            meaning_id:               lineData.meaning_id,
            prior_years:              lineData.prior_years,
            january:                  lineData.january,
            february:                 lineData.february,
            march:                    lineData.march,
            april:                    lineData.april,
            may:                      lineData.may,
            june:                     lineData.june,
            july:                     lineData.july,
            august:                   lineData.august,
            september:                lineData.september,
            october:                  lineData.october,
            november:                 lineData.november,
            december:                 lineData.december,
            total_curr_year:          lineData.total_curr_year,
            total_bal_next_year:      lineData.total_bal_next_year,
            additional_info:          lineData.additional_info,
            last_updated_by:          $application.user.email,
            last_updated_login:       $application.user.email,
          };

          // Encrypt method, primary key, and payload
          let enc_method = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: 'PUT' },
          });

          let enc_key = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: String(lineId) },
          });

          let enc_payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: payload },
          });

          // Call PUT endpoint — maps to process_data with method='PUT'
          const response = await Actions.callRest(context, {
            endpoint: 'PDD/postPmispddBudgetcontrolLineProcess',
            headers: {
              'x-session-code': enc_method,
              'x-session-id':   enc_key,
            },
            body: {
              payload: enc_payload,
            },
          });

          if (response.body && response.body.P_ERR_CODE === 'S') {
            $page.variables.bufferDPBudgetLines.instance.setItemStatus(
              updatedItems[index], 'submitted'
            );
          } else {
            hasError = true;
            const errMsg = response.body.P_ERR_MSG || 'Save failed for line ID: ' + lineId;
            console.error('Save error:', errMsg);
            $page.variables.bufferDPBudgetLines.instance.setItemStatus(
              updatedItems[index], 'unsubmitted'
            );
          }

        }, { mode: 'serial' });

        if (!hasError) {
          // Reset buffer
          await $page.variables.bufferDPBudgetLines.instance.resetAllUnsubmittedItems();

          // Reset next value counter
          await Actions.resetVariables(context, {
            variables: ['$variables.lvBudgetNextValue'],
          });

          // Reload fresh data from server
          await Actions.callChain(context, { chain: 'SynBudgetLinesAC' });

          // Refresh the buffer data provider
          // await Actions.fireDataProviderEvent(context, {
          //   refresh: null,
          //   target: $variables.bufferDPBudgetLines,
          // });

          // Exit edit mode
          $variables.lvBudgetEditMode = false;

          await Actions.fireNotificationEvent(context, {
            summary: 'Budget saved successfully.',
            type: 'confirmation',
            displayMode: 'transient',
          });

        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Some lines failed to save. Please check and retry.',
            displayMode: 'transient',
          });
        }

      } catch (error) {
        console.error('onClickSaveBudget error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Unexpected error during save: ' + error.message,
          displayMode: 'transient',
        });

      } finally {
        $variables.lvBudgetIsSaving = false;
        const dlg = document.getElementById('progressDialog');
        if (dlg) dlg.close();
      }
    }
  }

  return onClickSaveBudget;
});