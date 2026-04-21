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
        // ── Generate next temp negative key for new row ────────────────────
        if ($variables.lvNextHeaderValue === 9999999) {
          const arr = $page.variables.bufferDPStakeholderTable.instance.lastIterator?.mergedItemArray;

          if (arr && arr.length > 0) {
            const ids = arr.map(object => object.data.stakeholder_id);
            const min = Math.min(...ids);
            $page.variables.lvNextHeaderValue = min < 0 ? min - 1 : -1;
          } else {
            $page.variables.lvNextHeaderValue = -1;
          }
        } else {
          $variables.lvNextHeaderValue = $variables.lvNextHeaderValue - 1;
        }

        // ── Add new blank row to BufferingDataProvider ─────────────────────
        await $page.variables.bufferDPStakeholderTable.instance.addItem({
          metadata: {
            key: $variables.lvNextHeaderValue,
          },
          data: {
            stakeholder_id: $variables.lvNextHeaderValue,
            object_version_num: 0,
            line_num: 0,
            ora_project_id: $variables.projectDetailsVar.ora_project_id,
            tender_id: $variables.projectDetailsVar.tender_id,
            stakeholder_name: '',
            organization: '',
            contact_details: '',
            current_engagement_id: null,
            current_engagement: '',
            power: null,
            interest: null,
            expectations: '',
            approach_strategy: '',
            desired_engagement_id: null,
            desired_engagement: '',
            actions_taken: '',
            action_date: null,
            status: 'Open',
            additional_info: null,
            created_by: '',
            created_date: '',
            last_updated_by: '',
            last_updated_date: '',
            last_updated_login: '',
          },
        });

        console.log('lvNextHeaderValue:', $variables.lvNextHeaderValue);
        console.log('rowToEdit before set:', JSON.stringify($page.variables.rowToEdit));
        $page.variables.rowToEdit.rowKey = $variables.lvNextHeaderValue;
        console.log('rowToEdit after set:', JSON.stringify($page.variables.rowToEdit));


        console.log('Added new stakeholder row with temp key:', $variables.lvNextHeaderValue);

      } catch (error) {
        console.error('Error adding stakeholder row:', error);
      }
    }
  }

  return onAddHeaderRow;
});