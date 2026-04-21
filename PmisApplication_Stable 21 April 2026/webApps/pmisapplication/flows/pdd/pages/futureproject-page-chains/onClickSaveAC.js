define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onClickSaveAC extends ActionChain {

    sanitizeDate(value) {
      if (!value) return null;
      return String(value).substring(0, 10);
    }

    sanitizeRecord(record) {
      return {
        ...record,
        estimated_start_date: this.sanitizeDate(record.estimated_start_date),
        estimated_end_date:   this.sanitizeDate(record.estimated_end_date),
      };
    }

    isRowFilled(record) {
      return (
        (record.project_name   && String(record.project_name).trim()   !== '') ||
        (record.tender_number  && String(record.tender_number).trim()  !== '') ||
        (record.estimated_start_date != null)                                  ||
        (record.estimated_end_date   != null)                                  ||
        (record.year           != null)                                        ||
        (record.type           && String(record.type).trim()           !== '') ||
        (record.project_mgr_id != null)                                        ||
        (record.senior_mgr_usr_id != null)
      );
    }

    async run(context) {
      const { $page, $application, $variables } = context;

      try {
        document.getElementById('progressDialog').open();

        const submittableItems = $page.variables.futureProjectBDP.instance.getSubmittableItems();

        if (!submittableItems || submittableItems.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No changes to save.',
            displayMode: 'transient',
            type: 'warning',
          });
          return;
        }

        const addedItems   = submittableItems.filter(obj => obj.operation === 'add');
        const updatedItems = submittableItems.filter(obj => obj.operation === 'update');
        const removedItems = submittableItems.filter(obj => obj.operation === 'remove');

        let successCount = 0;
        let failCount    = 0;
        let skippedCount = 0;

        // ── Process NEW ROWS (POST) ──────────────────────────────────────
        for (let i = 0; i < addedItems.length; i++) {
          const record = this.sanitizeRecord({ ...addedItems[i].item.data });

          if (!this.isRowFilled(record)) {
            skippedCount++;
            console.log('Skipping empty new row, key=', addedItems[i].item.metadata.key);
            continue; // SynADP reload + resetAllUnsubmittedItems in finally cleans it up
          }

          record.future_project_id = null; // null out temp key — Oracle sequence assigns real ID

          try {
            const encryptedMethod = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'POST' },
            });
            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: '0' },
            });
            const encryptedPayload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: JSON.stringify(record) },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddFutureprojectProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-code': encryptedMethod,
                'x-session-id': encryptedId
                }, // no x-session-id for POST
            });

            console.log('POST response ==> ' + JSON.stringify(response.body));

            if (response.body && response.body.P_ERR_CODE === 'S') {
              successCount++;
            } else {
              failCount++;
              console.error('POST failed:', response.body ? response.body.P_ERR_MSG : 'Unknown');
            }
          } catch (err) {
            failCount++;
            console.error('Error on POST row:', err);
          }
        }

        // ── Process UPDATES (PUT) ────────────────────────────────────────
        for (let i = 0; i < updatedItems.length; i++) {
          const record = this.sanitizeRecord(updatedItems[i].item.data);
          const rowKey = updatedItems[i].item.metadata.key;

          try {
            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(rowKey) },
            });
            const encryptedMethod = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });
            const encryptedPayload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: JSON.stringify(record) },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddFutureprojectProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-id':   encryptedId,
                'x-session-code': encryptedMethod,
              },
            });

            console.log('PUT response ==> ' + JSON.stringify(response.body));

            if (response.body && response.body.P_ERR_CODE === 'S') {
              successCount++;
            } else {
              failCount++;
              console.error('PUT failed:', response.body ? response.body.P_ERR_MSG : 'Unknown');
            }
          } catch (err) {
            failCount++;
            console.error('Error on PUT row:', err);
          }
        }

        // ── Process DELETES ──────────────────────────────────────────────
        for (let i = 0; i < removedItems.length; i++) {
          const rowKey = removedItems[i].item.metadata.key;

          try {
            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(rowKey) },
            });
            const encryptedMethod = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'DELETE' },
            });
            const encryptedPayload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: JSON.stringify({ future_project_id: rowKey }) },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddFutureprojectProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-id':   encryptedId,
                'x-session-code': encryptedMethod,
              },
            });

            if (response.body && response.body.P_ERR_CODE === 'S') {
              successCount++;
            } else {
              failCount++;
              console.error('DELETE failed:', response.body ? response.body.P_ERR_MSG : 'Unknown');
            }
          } catch (err) {
            failCount++;
            console.error('Error on DELETE row:', err);
          }
        }

        // ── Notification ─────────────────────────────────────────────────
        if (failCount === 0 && skippedCount === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: `Future Project records saved successfully (${successCount} records)`,
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else if (failCount === 0 && skippedCount > 0) {
          await Actions.fireNotificationEvent(context, {
            summary: `${successCount} saved, ${skippedCount} empty row(s) skipped.`,
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: `${successCount} saved, ${failCount} failed. Check console for details.`,
            displayMode: 'persist',
            type: 'warning',
          });
        }

      } catch (error) {
        console.error('onClickSaveAC error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to save Future Project data.',
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        // Reload always runs — resetAllUnsubmittedItems inside SynADP clears all pending
        // items including skipped empty rows. setItemStatus is never called.
        try {
          await Actions.callChain(context, { chain: 'SynADPFutureProjectsAC' });
        } catch (reloadErr) {
          console.error('Data reload after save failed:', reloadErr);
        }
        $variables.lvNextValue = -1;
        document.getElementById('progressDialog').close();
      }
    }
  }

  return onClickSaveAC;
});