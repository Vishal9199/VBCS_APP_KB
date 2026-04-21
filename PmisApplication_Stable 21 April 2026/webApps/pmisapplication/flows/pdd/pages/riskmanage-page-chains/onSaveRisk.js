define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onSaveRisk extends ActionChain {

    /**
     * Strips ISO datetime string down to YYYY-MM-DD.
     * oj-input-date stores values as "2025-12-31T00:00:00.000Z" internally.
     * Oracle TO_DATE(...,'YYYY-MM-DD') fails with ORA-01830 if the time
     * portion is included — so we always trim to the first 10 characters.
     */
    sanitizeDate(value) {
      if (!value) return null;
      return String(value).substring(0, 10);
    }

    /**
     * Returns a clean copy of the record with all date fields sanitized.
     */
    sanitizeRecord(record) {
      return {
        ...record,
        expected_retirement: this.sanitizeDate(record.expected_retirement),
      };
    }

    /**
     * Validates that a new row has at least one meaningful field filled in.
     * Checks all user-entered fields — excludes system fields that are
     * auto-populated (project/tender info, created_by, etc.).
     *
     * Returns true  → row has data, should be saved.
     * Returns false → row is empty, should be skipped.
     */
    isRowFilled(record) {
      return (
        (record.risk_category_id  != null)                    ||
        (record.likelihood_id     != null)                    ||
        (record.owner_id          != null)                    ||
        (record.scope             != null)                    ||
        (record.time              != null)                    ||
        (record.cost              != null)                    ||
        (record.qhse              != null)                    ||
        (record.risk_description  && record.risk_description.trim()  !== '') ||
        (record.causes            && record.causes.trim()            !== '') ||
        (record.consequence       && record.consequence.trim()       !== '') ||
        (record.expected_occurrence && record.expected_occurrence.trim() !== '') ||
        (record.prevent_cont_actions && record.prevent_cont_actions.trim() !== '') ||
        (record.action_owner      && record.action_owner.trim()      !== '') ||
        (record.expected_retirement != null)
      );
    }

    async run(context) {
      const { $page, $application, $variables } = context;

      try {
        document.getElementById('progressDialog').open();

        const submittableItems = await $page.variables.riskBufferDP.instance.getSubmittableItems();

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

        let successCount = 0;
        let failCount    = 0;
        let skippedCount = 0;

        // ── POST new rows ─────────────────────────────────────────────────
        for (let i = 0; i < addedItems.length; i++) {
          const record = this.sanitizeRecord(addedItems[i].item.data);

          // FIX: Skip empty rows — user added rows without entering any data.
          // Mark them as submitted so they are cleared from the BDP without
          // hitting the API. They will be removed on resetAllUnsubmittedItems().
          if (!this.isRowFilled(record)) {
            skippedCount++;
            $page.variables.riskBufferDP.instance.setItemStatus(addedItems[i], 'submitted');
            console.log('POST skipped: empty row, key=', record.risk_id);
            continue;
          }

          console.log('POST payload expected_retirement:', record.expected_retirement);

          try {
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
              endpoint: 'PDD/postPmispddRiskmanageProcess',
              body: { payload: encryptedPayload },
              headers: { 'x-session-id': encryptedId, 'x-session-code': encryptedMethod },
            });
            if (saveResponse.body && saveResponse.body.P_ERR_CODE === 'S') {
              $page.variables.riskBufferDP.instance.setItemStatus(addedItems[i], 'submitted');
              successCount++;
            } else {
              failCount++;
              console.error('POST failed:', saveResponse.body.P_ERR_MSG);
            }
          } catch (err) {
            failCount++;
            console.error('Error on POST row:', err);
          }
        }

        // ── PUT updated rows ──────────────────────────────────────────────
        for (let i = 0; i < updatedItems.length; i++) {
          const record = this.sanitizeRecord(updatedItems[i].item.data);

          console.log('PUT payload expected_retirement:', record.expected_retirement);

          try {
            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(record.risk_id) },
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
              endpoint: 'PDD/postPmispddRiskmanageProcess',
              body: { payload: encryptedPayload },
              headers: { 'x-session-id': encryptedId, 'x-session-code': encryptedMethod },
            });
            if (saveResponse.body && saveResponse.body.P_ERR_CODE === 'S') {
              $page.variables.riskBufferDP.instance.setItemStatus(updatedItems[i], 'submitted');
              successCount++;
            } else {
              failCount++;
              console.error('PUT failed:', saveResponse.body.P_ERR_MSG);
            }
          } catch (err) {
            failCount++;
            console.error('Error on PUT row:', err);
          }
        }

        // ── Reload data ───────────────────────────────────────────────────
        try {
          // const encryptedTenderId = await Actions.callChain(context, {
          //   chain: 'application:encryptAC',
          //   params: { input: String($application.variables.pTenderId) },
          // });
          const riskResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddRiskmanageGetbytenderid',
            headers: { 'x-session-id': $application.variables.pTenderId },
          });
          $variables.ADPrisk.data = riskResponse.body.items || riskResponse.body.OUTPUT || [];
          console.log('Data reload after save succeeded.');
        } catch (reloadErr) {
          console.error('Data reload after save failed:', reloadErr);
        } finally {
          await $page.variables.riskBufferDP.instance.resetAllUnsubmittedItems();
          $variables.lvNextValue = -1;
          console.log('BDP reset complete. lvNextValue reset to -1.');
        }

        // ── Notification ──────────────────────────────────────────────────
        if (failCount === 0) {
          const skippedMsg = skippedCount > 0 ? ` (${skippedCount} empty row(s) discarded)` : '';
          await Actions.fireNotificationEvent(context, {
            summary: `Risk records saved successfully (${successCount} records)${skippedMsg}`,
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: `${successCount} saved, ${failCount} failed, ${skippedCount} empty discarded. Check console.`,
            displayMode: 'persist',
            type: 'warning',
          });
        }

      } catch (error) {
        console.error('onSaveRisk error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to save Risk Management data',
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return onSaveRisk;
});