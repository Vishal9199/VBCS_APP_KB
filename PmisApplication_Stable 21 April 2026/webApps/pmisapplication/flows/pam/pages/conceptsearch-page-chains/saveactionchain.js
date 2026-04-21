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

  class saveactionchain extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const submittableItems = await $page.variables.bufferDPTable.instance.getSubmittableItems();

      const filteredItems = submittableItems.filter(item => item.operation !== 'remove');

      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });
        await $page.variables.bufferDPTable.instance.resetAllUnsubmittedItems();
        return;
      }

      // ── Validation: check required fields before saving ────────────────
      const invalidRows = [];
      filteredItems.forEach((item, index) => {
        const data = item.item.data;
        const rowNum = index + 1;
        const errors = [];

        if (!data.project_id || data.project_id === 0) {
          errors.push('Project');
        }
        if (!data.phase_id) {
          errors.push('Phase');
        }
        if (!data.milestone_id) {
          errors.push('Milestone');
        }
        if (!data.cs_senior_mgr_id) {
          errors.push('Senior Concept Engineer');
        }
        if (!data.cs_planning_mgr_id) {
          errors.push('Planning Manager');
        }
        if (!data.consultant_id) {
          errors.push('Consultant');
        }

        if (errors.length > 0) {
          invalidRows.push(`Row ${rowNum}: Missing ${errors.join(', ')}`);
        }
      });

      if (invalidRows.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error',
          message: `Please fill required fields:\n${invalidRows.join('\n')}`,
          type: 'error',
          displayMode: 'persist',
        });
        return;
      }

      await this.setStatusTo(context, { pstatus: 'submitting' });

      let successAdd = 0;
      let successUpdate = 0;
      let failedItems = [];

      // ── Helper to strip time part from date strings ────────────────────
      const cleanDate = (d) => d ? d.split('T')[0] : null;

      const results = await ActionUtils.forEach(filteredItems, async (item, index) => {
        const op = item.operation;
        const rawPayload = item.item.data;
        const rowKey = item.item.metadata.key;

        const payload = {
          cs_dtl_id:              rawPayload.cs_dtl_id,
          object_version_num:     rawPayload.object_version_num,
          project_id:             rawPayload.project_id,
          phase_id:               rawPayload.phase_id,
          milestone_id:           rawPayload.milestone_id,
          cs_senior_mgr_id:       rawPayload.cs_senior_mgr_id,
          cs_planning_mgr_id:     rawPayload.cs_planning_mgr_id,
          consultant_id:          rawPayload.consultant_id,
          budget_amount:          rawPayload.budget_amount,
          planned_start_date:     cleanDate(rawPayload.planned_start_date),
          planned_end_date:       cleanDate(rawPayload.planned_end_date),
          revised_start_date:     cleanDate(rawPayload.revised_start_date),
          revised_end_date:       cleanDate(rawPayload.revised_end_date),
          actual_start_date:      cleanDate(rawPayload.actual_start_date),
          actual_end_date:        cleanDate(rawPayload.actual_end_date),
          completion_percentage:  rawPayload.completion_percentage,
          remarks:                rawPayload.remarks,
          created_by:             rawPayload.created_by,
          created_date:           cleanDate(rawPayload.creation_date),
          last_updated_by:        rawPayload.last_updated_by,
          last_updated_date:      cleanDate(rawPayload.last_update_date),
          last_updated_login:     rawPayload.last_updated_by,
        };

        try {
          if (op === 'add') {
            let encyp_key = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: '0' },
            });

            let enc_method = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'POST' },
            });

            let enc_payload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PAM/postPmispamConceptstudyProcess',
              headers: {
                'x-session-code': enc_method,
                'x-session-id': encyp_key,
              },
              body: { payload: enc_payload },
            });

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successAdd++;
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`ADD - ${rowKey}: ${response.body.P_ERR_MSG}`);
            }

          } else if (op === 'update') {
            let enc_pkey = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload.cs_dtl_id },
            });

            let enc_put_meth = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });

            let enc_put_pay = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload },
            });

            const response = await Actions.callRest(context, {
              endpoint: 'PAM/postPmispamConceptstudyProcess',
              headers: {
                'x-session-id': enc_pkey,
                'x-session-code': enc_put_meth,
              },
              body: { payload: enc_put_pay },
            });

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successUpdate++;
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`UPDATE - ${rowKey}: ${response.body.P_ERR_MSG}`);
            }
          }

        } catch (e) {
          failedItems.push(`${op.toUpperCase()} - ${rowKey}: ${e.message}`);
        }

      }, { mode: 'serial' });

      await this.setStatusTo(context, { pstatus: 'submitted' });
      await $page.variables.bufferDPTable.instance.resetAllUnsubmittedItems();

      if (failedItems.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: `Saved with errors. Added: ${successAdd}, Updated: ${successUpdate}`,
          message: failedItems.join('\n'),
          type: 'warning',
          displayMode: 'persist',
        });
      }

      await Actions.callChain(context, {
        chain: 'vbEnterListener',
      });
    }

    async setStatusTo(context, { pstatus }) {
      const { $page } = context;
      const editItems = await $page.variables.bufferDPTable.instance.getSubmittableItems();
      editItems.forEach(editItem => {
        $page.variables.bufferDPTable.instance.setItemStatus(editItem, pstatus);
      });
      return editItems;
    }
  }

  return saveactionchain;
});