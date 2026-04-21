define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onAddRisk extends ActionChain {

    async run(context) {
      const { $page, $application, $variables } = context;

      $variables.lvNextValue = $variables.lvNextValue - 1;
      const newKey = $variables.lvNextValue;

      const newRow = {
        risk_id:             newKey,
        object_version_num:  1,

        // FIX: All 6 fields now read from page variables populated in vbAfterNavigateListener
        // Previously: ora_project_id was hardcoded null (commented out),
        //             ora_project_number/name were empty strings,
        //             tender_id used $application.variables.pTenderId (encrypted string, not numeric ID),
        //             tender_number/name were empty strings never populated
        ora_project_id:      $variables.oraProjectId  || null,
        ora_project_number:  $variables.projectNumber || '',
        ora_project_name:    $variables.projectName   || '',
        tender_id:           $variables.tenderId      || null,
        tender_number:       $variables.tenderNumber  || '',
        tender_name:         $variables.tenderName    || '',

        // risk_number is a DB sequence — backend generates it on INSERT.
        // It must be null in the POST payload. Do not populate on new rows.
        risk_number:            null,

        risk_category_id:       null,
        risk_category_code:     '',
        risk_category:          '',
        risk_description:       '',
        causes:                 '',
        consequence:            '',
        expected_occurrence:    '',
        likelihood_id:          null,
        likelihood_code:        '',
        likelihood:             '',
        scope:                  null,
        time:                   null,
        cost:                   null,
        qhse:                   null,
        strength:               'Minor',
        overall_risk_rating:    'Low',
        risk_response_strategy: 'Mitigate',
        prevent_cont_actions:   '',
        owner_id:               null,
        owner_code:             '',
        owner:                  '',
        action_owner:           '',
        expected_retirement:    null,
        status:                 'Open',
        additional_info:        '',
        created_by:             $application.user.email || '',
        created_date:           '',
        last_updated_by:        $application.user.email || '',
        last_updated_date:      '',
        last_updated_login:     $application.user.email || '',
      };

      await $page.variables.riskBufferDP.instance.addItem({
        metadata: { key: newKey },
        data: newRow,
      });

      $variables.lvRowToEdit = { rowKey: newKey };

      console.log('onAddRisk: new row added, key=', newKey,
        '| ora_project_id:', newRow.ora_project_id,
        '| tender_id:', newRow.tender_id,
        '| tender_name:', newRow.tender_name
      );
    }
  }

  return onAddRisk;
});