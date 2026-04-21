define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onSaveIssue extends ActionChain {

    async run(context) {
      const { $page, $application, $variables } = context;

      // ─────────────────────────────────────────────────────────────
      // sanitizeDate: Strips ISO time component → YYYY-MM-DD only.
      // Oracle DATE columns from GET return "2026-02-14T07:04:39Z".
      // TO_DATE(...,'YYYY-MM-DD') throws ORA-01830 on the time part.
      // ─────────────────────────────────────────────────────────────
      function sanitizeDate(val) {
        if (!val) return null;
        return String(val).substring(0, 10);
      }

      // ─────────────────────────────────────────────────────────────
      // validateRecord: Returns array of missing required field names.
      // Any record with missing fields is REJECTED before API call.
      // ─────────────────────────────────────────────────────────────
      function validateRecord(record) {
        const missing = [];
        if (!record.issue_number)      missing.push('Issue Number');
        if (!record.date_raised)       missing.push('Date Raised');
        if (!record.issue_description) missing.push('Issue Description');
        if (!record.priority)          missing.push('Priority');
        if (!record.scope)             missing.push('Scope');
        if (!record.time)              missing.push('Time');
        if (!record.cost)              missing.push('Cost');
        if (!record.qhse)              missing.push('QHSE');
        if (!record.progress)          missing.push('Progress');
        return missing;
      }

      try {
        document.getElementById('issueProgressDialog').open();

        const submittableItems = await $page.variables.issueBufferDP.instance.getSubmittableItems();

        if (!submittableItems || submittableItems.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No changes to save',
            displayMode: 'transient',
            type: 'warning',
          });
          return;
        }

        const addedItems   = submittableItems.filter(obj => obj.operation === 'add');
        const updatedItems = submittableItems.filter(obj => obj.operation === 'update');

        console.log('onSaveIssue: add=' + addedItems.length + ', update=' + updatedItems.length);

        let successCount  = 0;
        let failCount     = 0;
        let skippedCount  = 0;
        const skippedRows = [];

        // ── POST new rows ──────────────────────────────────────────────────
        for (let i = 0; i < addedItems.length; i++) {
          const record = { ...addedItems[i].item.data };

          // ✅ VALIDATION: Reject empty/incomplete rows before API call.
          const missingFields = validateRecord(record);
          if (missingFields.length > 0) {
            skippedCount++;
            skippedRows.push('Row ' + (i + 1) + ': ' + missingFields.join(', '));
            console.warn('onSaveIssue: POST skipped — missing fields:', missingFields, 'key=', addedItems[i].item.metadata.key);
            // Remove the empty row from BDP so it doesn't persist as pending
            await $page.variables.issueBufferDP.instance.removeItem({
              metadata: { key: addedItems[i].item.metadata.key },
            });
            continue;
          }

          try {
            record.date_raised             = sanitizeDate(record.date_raised);
            record.due_date_for_resolution = sanitizeDate(record.due_date_for_resolution);
            record.data_resolved           = sanitizeDate(record.data_resolved);
            record.created_date            = null;
            record.last_updated_date       = null;

            const encryptedMethod = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'POST' },
            });

            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(record.tender_id) },
            });

            const encryptedPayload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: JSON.stringify(record) },
            });

            const saveResponse = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddIssueregisterProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-id':   encryptedId,
                'x-session-code': encryptedMethod,
              },
            });

            if (saveResponse.body && saveResponse.body.P_ERR_CODE === 'S') {
              $page.variables.issueBufferDP.instance.setItemStatus(addedItems[i], 'submitted');
              successCount++;
              console.log('POST success, temp key=', addedItems[i].item.metadata.key);
            } else {
              failCount++;
              console.error('POST failed:', saveResponse.body.P_ERR_MSG);
            }

          } catch (err) {
            failCount++;
            console.error('Error on POST row:', err);
          }
        }

        // ── PUT updated rows ───────────────────────────────────────────────
        for (let i = 0; i < updatedItems.length; i++) {
          const record = { ...updatedItems[i].item.data };

          // ✅ VALIDATION: Also validate existing rows on PUT (defensive).
          const missingFields = validateRecord(record);
          if (missingFields.length > 0) {
            skippedCount++;
            skippedRows.push('Issue #' + (record.issue_number || record.issue_id) + ': ' + missingFields.join(', '));
            console.warn('onSaveIssue: PUT skipped — missing fields:', missingFields, 'issue_id=', record.issue_id);
            continue;
          }

          try {
            record.date_raised             = sanitizeDate(record.date_raised);
            record.due_date_for_resolution = sanitizeDate(record.due_date_for_resolution);
            record.data_resolved           = sanitizeDate(record.data_resolved);
            record.created_date            = null;
            record.last_updated_date       = null;

            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(record.issue_id) },
            });

            const encryptedMethod = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });

            const encryptedPayload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: JSON.stringify(record) },
            });

            const saveResponse = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddIssueregisterProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-id':   encryptedId,
                'x-session-code': encryptedMethod,
              },
            });

            if (saveResponse.body && saveResponse.body.P_ERR_CODE === 'S') {
              $page.variables.issueBufferDP.instance.setItemStatus(updatedItems[i], 'submitted');
              successCount++;
              console.log('PUT success, issue_id=', record.issue_id);
            } else {
              failCount++;
              console.error('PUT failed:', saveResponse.body.P_ERR_MSG);
            }

          } catch (err) {
            failCount++;
            console.error('Error on PUT row:', err);
          }
        }

        // ── Handle all-skipped scenario (nothing was valid to save) ────────
        if (successCount === 0 && failCount === 0 && skippedCount > 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Required fields missing: ' + skippedRows.join(' | '),
            displayMode: 'persist',
            type: 'warning',
          });
          return;
        }

        // ── Reload data from DB ────────────────────────────────────────────
        try {
          const issueResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddIssueregisterGetbytenderid',
            headers: { 'x-session-id': $application.variables.pTenderId },
          });

          $variables.ADPissue.data = issueResponse.body.items || issueResponse.body.OUTPUT || [];

          await $page.variables.issueBufferDP.instance.resetAllUnsubmittedItems();

          $variables.lvNextValue = -1;

          console.log('onSaveIssue: data reloaded after save, count=', $variables.ADPissue.data.length);
        } catch (reloadErr) {
          console.error('Data reload after save failed:', reloadErr);
        }

        // ── Notification ───────────────────────────────────────────────────
        if (failCount === 0 && skippedCount === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Issue records saved successfully (' + successCount + ' records)',
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          const parts = [];
          if (successCount > 0) parts.push(successCount + ' saved');
          if (failCount > 0)    parts.push(failCount + ' failed');
          if (skippedCount > 0) parts.push(skippedCount + ' skipped (missing required fields)');
          await Actions.fireNotificationEvent(context, {
            summary: parts.join(', ') + '. Check console for details.',
            displayMode: 'transient',
            type: 'warning',
          });
        }

      } catch (error) {
        console.error('onSaveIssue error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to save Issue Register data',
          displayMode: 'transient',
          type: 'error',
        });
      } finally {
        document.getElementById('issueProgressDialog').close();
      }
    }
  }

  return onSaveIssue;
});