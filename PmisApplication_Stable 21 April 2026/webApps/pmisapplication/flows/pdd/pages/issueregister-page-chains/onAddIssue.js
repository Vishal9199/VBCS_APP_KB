define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onAddIssue extends ActionChain {

    async run(context) {
      const { $page, $application, $variables } = context;

      // ── Auto-compute next issue_number ─────────────────────────────
      // Issue number is sequential per tender — like a line number.
      // Find the highest existing issue_number across all current rows
      // (both DB-saved rows in ADPissue and any unsaved BDP rows).
      const existingData = $variables.ADPissue.data || [];
      const maxIssueNumber = existingData.reduce((max, row) => {
        const num = parseInt(row.issue_number) || 0;
        return num > max ? num : max;
      }, 0);
      const nextIssueNumber = maxIssueNumber + 1;

      // ── Decrement temp key ─────────────────────────────────────────
      $variables.lvNextValue = $variables.lvNextValue - 1;
      const tempKey = $variables.lvNextValue;

      // ── Build new row ──────────────────────────────────────────────
      const newRow = {
        issue_id:                    tempKey,
        object_version_num:          1,
        ora_project_id:              $variables.project_id,
        tender_id:                   $variables.tender_id,
        issue_number:                nextIssueNumber,   // ✅ auto-assigned
        date_raised:                 null,
        issue_description:           null,
        scope:                       null,
        time:                        null,
        cost:                        null,
        qhse:                        null,
        total_score:                 0,
        priority:                    null,
        action:                      null,
        owner:                       null,
        outcome:                     null,
        due_date_for_resolution:     null,
        resolution_progress_update:  null,
        progress:                    null,
        status:                      'In Progress',
        data_resolved:               null,
        additional_info:             null,
        created_by:                  $application.user.email,
        created_date:                null,
        last_updated_by:             $application.user.email,
        last_updated_date:           null,
        last_updated_login:          $application.user.email,
      };

      // ── Add to BDP ────────────────────────────────────────────────
      await $page.variables.issueBufferDP.instance.addItem({
        metadata: { key: tempKey },
        data: newRow,
      });

      // ── Trigger edit mode immediately ─────────────────────────────
      await Actions.assignVariable(context, {
        variable: '$page.variables.lvRowToEdit',
        value: { rowKey: tempKey },
      });

      console.log('onAddIssue: new row added, key=', tempKey, '| issue_number=', nextIssueNumber);
    }
  }

  return onAddIssue;
});