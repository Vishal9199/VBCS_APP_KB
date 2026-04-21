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

  class onAddChangeControlRow extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // ── Generate next temp negative key for new row ────────────────────
        if ($variables.lvNextHeaderValue === 9999999) {
          const arr = $page.variables.bufferDPChangeControlTable.instance.lastIterator?.mergedItemArray;

          if (arr && arr.length > 0) {
            const ids = arr.map(object => object.data.control_register_id);
            const min = Math.min(...ids);
            $page.variables.lvNextHeaderValue = min < 0 ? min - 1 : -1;
          } else {
            $page.variables.lvNextHeaderValue = -1;
          }
        } else {
          $variables.lvNextHeaderValue = $variables.lvNextHeaderValue - 1;
        }

        // ── Add new blank row to BufferingDataProvider ─────────────────────
        await $page.variables.bufferDPChangeControlTable.instance.addItem({
          metadata: {
            key: $variables.lvNextHeaderValue,
          },
          data: {
            control_register_id:        $variables.lvNextHeaderValue,
            object_version_num:         0,
            ora_project_id:             $variables.projectHeaderVar.ora_project_id,
            tender_id:                  $variables.projectHeaderVar.tender_id,
            change_request_id:          null,
            cr_number:                  '',
            vo_number:                  '',
            change_control_number:      null,
            project_manager:            '',
            initiator:                  '',
            time_impact:                0,
            original_contract_value:    $variables.projectHeaderVar.original_contract_value,
            revised_contract_amount:    $variables.projectHeaderVar.revised_contract_amount,
            addition_a:                 0,
            omission_b:                 0,
            total_change:               0,
            net_change:                 0,
            net_percentage_of_change:   0,
            total_vol_of_change:        0,
            status:                     'Open',
            open_reason_id:             null,
            open_reason_code:           '',
            open_reason:                '',
            remarks:                    '',
            additional_info:            null,
            created_by:                 '',
            created_date:               '',
            last_updated_by:            '',
            last_updated_date:          '',
            last_updated_login:         '',
          },
        });

        // ── Trigger edit mode ──────────────────────────────────────────────
        $page.variables.rowToEdit.rowKey = $variables.lvNextHeaderValue;

        console.log('Added new change control row with temp key:', $variables.lvNextHeaderValue);

      } catch (error) {
        console.error('Error adding change control row:', error);
      }
    }
  }

  return onAddChangeControlRow;
});