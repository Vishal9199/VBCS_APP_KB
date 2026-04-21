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

  class onClickSave extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ── Resolve common values once ─────────────────────────────────────────
      const currentUser = $application.user.username;
      const currentDate = this.formatDate($application.functions.getSysdate());
      const tenderId = $variables.projectDetailsVar.tender_id;
      const projectId = $variables.projectDetailsVar.ora_project_id;

      // ── Step 1: Get all buffered changes ───────────────────────────────────
      const submittableItems = await $page.variables.bufferDPStakeholderTable.instance.getSubmittableItems();

      // ── Step 2: Filter out removes ─────────────────────────────────────────
      const filteredItems = submittableItems.filter(item => item.operation !== 'remove');

      // ── Step 3: Nothing to save ────────────────────────────────────────────
      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });

        await this.setStatusTo(context, { pstatus: 'submitted' });
        await $page.variables.bufferDPStakeholderTable.instance.resetAllUnsubmittedItems();
        return;
      }

      // ── Step 3a: Validate add rows are not empty ───────────────────────────
      const requiredFields = [
        'stakeholder_name',
        'organization',
        'contact_details',
        'current_engagement_id',
        'power',
        'interest',
        'desired_engagement_id',
      ];

      const emptyRows = filteredItems
        .filter(item => item.operation === 'add')
        .reduce((acc, item, idx) => {
          const data = item.item.data;
          const missing = requiredFields.filter(f => {
            const val = data[f];
            return val === null || val === undefined || val === '' || val === 0 || String(val).trim() === '';
          });
          if (missing.length > 0) {
            acc.push(`Row ${idx + 1}: Missing – ${missing.join(', ')}`);
          }
          return acc;
        }, []);

      if (emptyRows.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Please fill in all required fields before saving.',
          message: emptyRows.join('\n'),
          type: 'warning',
          displayMode: 'persist',
        });
        return;
      }

      // ── Step 4: Mark all as submitting ─────────────────────────────────────
      await this.setStatusTo(context, { pstatus: 'submitting' });

      let successAdd = 0;
      let successUpdate = 0;
      let failedItems = [];

      // ── Step 5: Iterate rows serially ──────────────────────────────────────
      await ActionUtils.forEach(filteredItems, async (item, index) => {
        const op = item.operation;
        const rawPayload = item.item.data;
        const rowKey = item.item.metadata.key;

        try {
          if (op === 'add') {
            // ── NEW ROW ──────────────────────────────────────────────────────
            const payload = {
              'tender_id': parseInt(tenderId, 10),
              'ora_project_id': parseInt(projectId, 10),
              'line_num': 0,
              'stakeholder_name': rawPayload.stakeholder_name,
              'organization': rawPayload.organization,
              'contact_details': rawPayload.contact_details,
              'current_engagement_id': parseInt(rawPayload.current_engagement_id, 10),
              'current_engagement': rawPayload.current_engagement,
              'power': parseInt(rawPayload.power, 10),
              'interest': parseInt(rawPayload.interest, 10),
              'expectations': rawPayload.expectations ?? null,
              'approach_strategy': rawPayload.approach_strategy ?? null,
              'desired_engagement_id': parseInt(rawPayload.desired_engagement_id, 10),
              'desired_engagement': rawPayload.desired_engagement,
              'actions_taken': rawPayload.actions_taken ?? null,
              'action_date': this.formatDate(rawPayload.action_date) ?? null,
              'status': rawPayload.status,
              'additional_info': rawPayload.additional_info ?? null,
              'object_version_num': 0,
              'created_by': currentUser,
              'created_date': currentDate,
              'last_updated_by': currentUser,
              'last_updated_date': currentDate,
              'last_updated_login': currentUser,
            };

            const encyp_key = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: '0' },
            });

            const enc_method = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'POST' },
            });

            const enc_payload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddStakeholderProcess',
              headers: {
                'x-session-id': encyp_key,
                'x-session-code': enc_method,
              },
              body: {
                payload: enc_payload,
              },
            });

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successAdd++;
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`ADD - Row ${index + 1}: ${response.body.P_ERR_MSG}`);
            }

          } else if (op === 'update') {
            // ── EXISTING ROW ─────────────────────────────────────────────────
            const payload = {
              'stakeholder_id': parseInt(rawPayload.stakeholder_id, 10),
              'object_version_num': parseInt(rawPayload.object_version_num, 10),
              'line_num': parseInt(rawPayload.line_num, 10),
              'tender_id': parseInt(tenderId, 10),
              'ora_project_id': parseInt(projectId, 10),
              'stakeholder_name': rawPayload.stakeholder_name,
              'organization': rawPayload.organization,
              'contact_details': rawPayload.contact_details,
              'current_engagement_id': parseInt(rawPayload.current_engagement_id, 10),
              'current_engagement': rawPayload.current_engagement,
              'power': parseInt(rawPayload.power, 10),
              'interest': parseInt(rawPayload.interest, 10),
              'expectations': rawPayload.expectations ?? null,
              'approach_strategy': rawPayload.approach_strategy ?? null,
              'desired_engagement_id': parseInt(rawPayload.desired_engagement_id, 10),
              'desired_engagement': rawPayload.desired_engagement,
              'actions_taken': rawPayload.actions_taken ?? null,
              'action_date': this.formatDate(rawPayload.action_date) ?? null,
              'status': rawPayload.status,
              'additional_info': rawPayload.additional_info ?? null,
              'created_by': rawPayload.created_by,
              'created_date': this.formatDate(rawPayload.created_date),
              'last_updated_by': currentUser,
              'last_updated_date': currentDate,
              'last_updated_login': currentUser,
            };

            const enc_pkey = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload.stakeholder_id },
            });

            const enc_put_meth = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });

            const enc_put_pay = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddStakeholderProcess',
              headers: {
                'x-session-id': enc_pkey,
                'x-session-code': enc_put_meth,
              },
              body: {
                payload: enc_put_pay,
              },
            });

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successUpdate++;
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`UPDATE - Row ${index + 1}: ${response.body.P_ERR_MSG}`);
            }
          }

        } catch (e) {
          failedItems.push(`${op.toUpperCase()} - Row ${index + 1}: ${e.message}`);
        }

      }, { mode: 'serial' });

      // ── Step 6: Mark submitted and reset buffer ────────────────────────────
      await this.setStatusTo(context, { pstatus: 'submitted' });
      await $page.variables.bufferDPStakeholderTable.instance.resetAllUnsubmittedItems();

      // ── Step 7: Show warning summary if any failures ───────────────────────
      if (failedItems.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: `Saved with errors. Added: ${successAdd}, Updated: ${successUpdate}`,
          message: failedItems.join('\n'),
          type: 'warning',
          displayMode: 'persist',
        });
      }

      // ── Step 8: Refresh table ──────────────────────────────────────────────
      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });
    }

    /**
     * Strips time portion from ISO date strings — returns YYYY-MM-DD only
     * Handles: "2026-02-03T00:00:00Z", "2026-02-18T08:12:34.723613Z", "2026-02-18"
     * @param {string} dateStr
     * @returns {string|null}
     */
    formatDate(dateStr) {
      if (!dateStr) return null;
      return dateStr.toString().substring(0, 10);
    }

    /**
     * Sets status of all submittable items in the buffer
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.pstatus - 'submitting' | 'submitted' | 'unsubmitted'
     */
    async setStatusTo(context, { pstatus }) {
      const { $page } = context;

      const editItems = await $page.variables.bufferDPStakeholderTable.instance.getSubmittableItems();
      editItems.forEach(editItem => {
        $page.variables.bufferDPStakeholderTable.instance.setItemStatus(editItem, pstatus);
      });
      return editItems;
    }
  }

  return onClickSave;
});