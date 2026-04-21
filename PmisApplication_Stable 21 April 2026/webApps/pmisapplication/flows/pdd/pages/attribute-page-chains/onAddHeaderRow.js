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

  class onAddHeaderRow extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // ── Generate next temp negative key ───────────────────────────────
        if ($variables.lvNextHeaderValue === 9999999) {
          const arr = $page.variables.bufferDPHeaderTable.instance.lastIterator?.mergedItemArray;

          if (arr && arr.length > 0) {
            const ids = arr.map(object => object.data.attribute_header_id);
            const min = Math.min(...ids);
            $page.variables.lvNextHeaderValue = min < 0 ? min - 1 : -1;
          } else {
            $page.variables.lvNextHeaderValue = -1;
          }
        } else {
          $variables.lvNextHeaderValue = $variables.lvNextHeaderValue - 1;
        }

        // ── Add new blank row ──────────────────────────────────────────────
        await $page.variables.bufferDPHeaderTable.instance.addItem({
          metadata: {
            key: $variables.lvNextHeaderValue
          },
          data: {
            attribute_header_id:  $variables.lvNextHeaderValue,
            activity_id:          null,
            activity:             '',
            quantity:             0,
            unit_of_measurement:  '',
            activity_remark:      '',
            ora_project_id:       $variables.projectDetailsVar.ora_project_id,
            tender_id:            $variables.projectDetailsVar.tender_id,
            object_version_num:   0,
            created_by:           $application.user.email,
            last_updated_by:      $application.user.email,
            last_updated_login:   $application.user.email,
          }
        });

        // ── Trigger edit mode ──────────────────────────────────────────────
        $page.variables.rowToEdit.rowKey = $variables.lvNextHeaderValue;

        console.log('Added new header row with key:', $variables.lvNextHeaderValue);

      } catch (error) {
        console.error('Error adding header row:', error);
      }
    }
  }

  return onAddHeaderRow;
});