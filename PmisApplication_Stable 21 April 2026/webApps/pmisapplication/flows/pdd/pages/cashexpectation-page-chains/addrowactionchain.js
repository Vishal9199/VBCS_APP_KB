define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class addrowactionchain extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $application } = context;

      // Decrement lvNextValue for new row key
      if ($page.variables.lvNextValue === 9999999999 || 
          $page.variables.lvNextValue === undefined) {
        $page.variables.lvNextValue = -1;
      } else {
        $page.variables.lvNextValue = $page.variables.lvNextValue - 1;
      }

      const newRow = {
        cash_expectation_id: $page.variables.lvNextValue,
        object_version_num: 0,
        project_id: null,
        project_name: "",
        project_number: "",
        region_name: "",
        tender_number: "",
        year: null,
        type: "",
        jan_curr_year: null,
        jan_next_year: null,
        feb_curr_year: null,
        feb_next_year: null,
        mar_curr_year: null,
        mar_next_year: null,
        apr_curr_year: null,
        apr_next_year: null,
        may_curr_year: null,
        may_next_year: null,
        jun_curr_year: null,
        jun_next_year: null,
        jul_curr_year: null,
        jul_next_year: null,
        aug_curr_year: null,
        aug_next_year: null,
        sep_curr_year: null,
        sep_next_year: null,
        oct_curr_year: null,
        oct_next_year: null,
        nov_curr_year: null,
        nov_next_year: null,
        dec_curr_year: null,
        dec_next_year: null,
        additional_info: "",
        created_by: $application.user.email || 'CURRENT_USER',
        created_date: new Date().toISOString(),
        last_updated_by: $application.user.email || 'CURRENT_USER',
        last_updated_date: new Date().toISOString(),
        last_updated_login: $application.user.email || 'CURRENT_USER',
      };

      await $page.variables.bufferDPcahExpTable.instance.addItem({
        metadata: { key: $page.variables.lvNextValue },
        data: newRow,
      });

      // Set rowToEdit to open the new row in edit mode
      $page.variables.rowToEdit = { rowKey: $page.variables.lvNextValue };
    }
  }

  return addrowactionchain;
});