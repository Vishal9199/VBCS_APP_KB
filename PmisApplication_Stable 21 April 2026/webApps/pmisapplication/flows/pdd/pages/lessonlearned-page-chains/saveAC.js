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

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const currentUser = $application.user.username;
      const currentDate = this.formatDate($application.functions.getSysdate());
      const tenderId = $variables.projectDetailsVar.tender_id;
      const projectId = $variables.projectDetailsVar.ora_project_id;

      const submittableItems = await $page.variables.bufferDPlessonlearnedTable.instance.getSubmittableItems();
      const filteredItems = submittableItems.filter(item => item.operation !== 'remove');

      if (filteredItems.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'No changes have been made!',
          type: 'info',
          displayMode: 'transient',
        });
        await $page.variables.bufferDPlessonlearnedTable.instance.resetAllUnsubmittedItems();
        return;
      }

      // ── Step 1: Validate each row and split into valid / invalid ───────────
      const validItems = [];
      const invalidItems = [];
      const validationErrorMessages = [];

      filteredItems.forEach((item, index) => {
        const rawPayload = item.item.data;
        const rowNum = index + 1;
        const rowErrors = [];

        if (!rawPayload.lesson_category_id) {
          rowErrors.push('Lesson Category is required');
        }
        if (!rawPayload.lesson_type || String(rawPayload.lesson_type).trim() === '') {
          rowErrors.push('Lesson Type is required');
        }
        if (!rawPayload.lesson_impact || String(rawPayload.lesson_impact).trim() === '') {
          rowErrors.push('Lesson Impact is required');
        }

        if (rowErrors.length > 0) {
          invalidItems.push(item);
          validationErrorMessages.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
        } else {
          validItems.push(item);
        }
      });

      // ── Step 2: Immediately discard ONLY invalid rows ──────────────────────
      // Transition through 'submitting' → 'submitted' so resetAllUnsubmittedItems()
      // will drop them from the buffer (they were never saved, so they vanish from the table)
      if (invalidItems.length > 0) {
        invalidItems.forEach(item => {
          $page.variables.bufferDPlessonlearnedTable.instance.setItemStatus(item, 'submitting');
          $page.variables.bufferDPlessonlearnedTable.instance.setItemStatus(item, 'submitted');
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Please fill the required fields',
          type: 'warning',
          displayMode: 'persist',
        });

        // If nothing valid remains — just reset and exit
        if (validItems.length === 0) {
          await $page.variables.bufferDPlessonlearnedTable.instance.resetAllUnsubmittedItems();
          return;
        }
      }

      // ── Step 3: Mark ONLY valid rows as 'submitting' ───────────────────────
      // Do NOT use setStatusTo() here — it re-fetches ALL items and would
      // overwrite the 'submitted' status we just set on the invalid rows
      validItems.forEach(item => {
        $page.variables.bufferDPlessonlearnedTable.instance.setItemStatus(item, 'submitting');
      });

      let successAdd = 0;
      let successUpdate = 0;
      let failedItems = [];

      // ── Step 4: Save only valid rows ───────────────────────────────────────
      await ActionUtils.forEach(validItems, async (item, index) => {
        const op = item.operation;
        const rawPayload = item.item.data;

        try {
          if (op === 'add') {
            const payload = {
              'lesson_id': rawPayload.lesson_id,
              'ora_project_id': parseInt(projectId, 10),
              'ora_project_name': rawPayload.ora_project_name ?? null,
              'ora_project_number': rawPayload.ora_project_number ?? null,
              'tender_id': parseInt(tenderId, 10),
              'tender_name': rawPayload.tender_name ?? null,
              'tender_number': rawPayload.tender_number ?? null,
              'period': rawPayload.period ?? null,
              'lesson_date': this.formatDate(rawPayload.lesson_date) ?? null,
              'lesson_type': rawPayload.lesson_type ?? null,
              'lesson_category_id': parseInt(rawPayload.lesson_category_id, 10),
              'lesson_category': rawPayload.lesson_category ?? null,
              'lesson_category_code': rawPayload.lesson_category_code ?? null,
              'lesson_status': rawPayload.lesson_status ?? null,
              'lesson_impact': rawPayload.lesson_impact ?? null,
              'lesson_recommendation': rawPayload.lesson_recommendation ?? null,
              'logged_by': rawPayload.logged_by ?? null,
              'continuous_process': rawPayload.continuous_process ?? null,
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
              endpoint: 'PDD/postPmispddLessonlearnedProcess',
              headers: {
                'x-session-id': encyp_key,
                'x-session-code': enc_method,
              },
              body: { payload: enc_payload },
            });

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successAdd++;
              // ✅ Mark this row as submitted only after a successful API save
              $page.variables.bufferDPlessonlearnedTable.instance.setItemStatus(item, 'submitted');
              await Actions.fireNotificationEvent(context, {
                summary: response.body.P_ERR_MSG,
                displayMode: 'transient',
                type: 'confirmation',
              });
            } else {
              failedItems.push(`ADD - Row ${index + 1}: ${response.body.P_ERR_MSG}`);
            }

          } else if (op === 'update') {
            const payload = {
              'lesson_id': rawPayload.lesson_id,
              'ora_project_id': parseInt(projectId, 10),
              'ora_project_name': rawPayload.ora_project_name ?? null,
              'ora_project_number': rawPayload.ora_project_number ?? null,
              'tender_id': parseInt(tenderId, 10),
              'tender_name': rawPayload.tender_name ?? null,
              'tender_number': rawPayload.tender_number ?? null,
              'period': rawPayload.period ?? null,
              'lesson_date': this.formatDate(rawPayload.lesson_date) ?? null,
              'lesson_type': rawPayload.lesson_type ?? null,
              'lesson_category_id': parseInt(rawPayload.lesson_category_id, 10),
              'lesson_category': rawPayload.lesson_category ?? null,
              'lesson_category_code': rawPayload.lesson_category_code ?? null,
              'lesson_status': rawPayload.lesson_status ?? null,
              'lesson_impact': rawPayload.lesson_impact ?? null,
              'lesson_recommendation': rawPayload.lesson_recommendation ?? null,
              'logged_by': rawPayload.logged_by ?? null,
              'continuous_process': rawPayload.continuous_process ?? null,
              'additional_info': rawPayload.additional_info ?? null,
              'object_version_num': rawPayload.object_version_num ?? 0,
              'created_by': rawPayload.created_by,
              'created_date': rawPayload.created_date,
              'last_updated_by': currentUser,
              'last_updated_date': currentDate,
              'last_updated_login': currentUser,
            };

            const enc_pkey = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: payload.lesson_id.toString() },
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
              endpoint: 'PDD/postPmispddLessonlearnedProcess',
              headers: {
                'x-session-id': enc_pkey,
                'x-session-code': enc_put_meth,
              },
              body: { payload: enc_put_pay },
            });

            if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {
              successUpdate++;
              // ✅ Mark this row as submitted only after a successful API save
              $page.variables.bufferDPlessonlearnedTable.instance.setItemStatus(item, 'submitted');
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

      // ── Step 5: Reset — removes rows marked 'submitted', keeps failed ones ─
      await $page.variables.bufferDPlessonlearnedTable.instance.resetAllUnsubmittedItems();

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

    formatDate(dateStr) {
      if (!dateStr) return null;
      return dateStr.toString().substring(0, 10);
    }

  }

  return onClickSave;
});