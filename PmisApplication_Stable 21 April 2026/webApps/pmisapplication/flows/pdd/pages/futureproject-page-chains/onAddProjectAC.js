define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onAddProjectAC extends ActionChain {

    async run(context) {
      const { $page, $application, $variables } = context;

      // Decrement to generate a unique negative temp key
      $variables.lvNextValue = $variables.lvNextValue - 1;
      const newKey = $variables.lvNextValue;

      const newRow = {
        future_project_id:   newKey,   // temp key — set to null by PL/SQL on INSERT
        object_version_num:  1,

        project_name:        '',
        tender_number:       '',
        senior_mgr_usr_id:   null,
        senior_manager:      '',
        project_mgr_id:      null,
        project_manager:     '',
        region_id:           null,
        region_code:         '',
        region_name:         '',
        active_flag:         'Y',
        estimated_start_date: null,
        estimated_end_date:   null,
        estimated_cost:       null,
        year:                 null,
        type:                 '',

        january:    null,
        february:   null,
        march:      null,
        april:      null,
        may:        null,
        june:       null,
        july:       null,
        august:     null,
        september:  null,
        october:    null,
        november:   null,
        december:   null,

        jan_actual: null,
        feb_actual: null,
        mar_actual: null,
        apr_actual: null,
        may_actual: null,
        jun_actual: null,
        jul_actual: null,
        aug_actual: null,
        sep_actual: null,
        oct_actual: null,
        nov_actual: null,
        dec_actual: null,

        additional_info:    '',
        created_by:         $application.user.email || '',
        created_date:       '',
        last_updated_by:    $application.user.email || '',
        last_updated_date:  '',
        last_updated_login: $application.user.email || '',
      };

      await $page.variables.futureProjectBDP.instance.addItem({
        metadata: { key: newKey },
        data: newRow,
      });

      // Auto-open the new row in edit mode
      $variables.lvRowToEdit = { rowKey: newKey };

      console.log('onAddProjectAC: new row added, key=', newKey);
    }
  }

  return onAddProjectAC;
});