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

  class vbEnterListener extends ActionChain {

    /**
     * vbEnterListener
     * Fires on page load.
     * 1. Loads Project / Tender info → populates Panel 1 (view-only).
     * 2. If pddIncId > 0 → EDIT mode : loads existing In-Country Value record.
     * 3. If pddIncId = 0 → ADD  mode : pre-fills IDs from project response only.
     *
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {

        // ─────────────────────────────────────────────────────────
        // STEP 1: Load Project / Tender Info  (Panel 1 – view only)
        // ─────────────────────────────────────────────────────────
        const projectResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: { 'x-session-id': $application.variables.pTenderId },
        });

        if (projectResponse.body && projectResponse.body.items && projectResponse.body.items[0]) {
          const info = projectResponse.body.items[0];

          // Populate Panel 1 (view-only) variables
          $variables.onloadData.projectName   = info.project_name   || '';
          $variables.onloadData.projectNumber = info.project_number || '';
          $variables.onloadData.tenderNumber  = info.tender_number  || '';

          // Carry IDs into form variable for use during Save
          $variables.inCountryValueVar.oraProjectId = info.project_id || null;
          $variables.inCountryValueVar.tenderId      = info.tender_id  || null;

          // % SME = 10% of revised contract amount from project info
          $variables.onloadData.percSME = info.revised_contract_amount
            ? (info.revised_contract_amount * 0.10)
            : 0;

          // Days Left: calculated server-side; if end date passed show 0
          $variables.onloadData.daysLeft = info.days_left != null ? info.days_left : 0;
        }

        // ─────────────────────────────────────────────────────────
        // STEP 2: EDIT mode → load existing In-Country Value record
        // ─────────────────────────────────────────────────────────
        const pddIncId = $variables.inputPddIncId;

        let temp_tender_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.inCountryValueVar.tenderId,
          },
        });

        let temp_ora_project_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.inCountryValueVar.oraProjectId,
          },
        });

        // if (pddIncId && pddIncId > 0) {

          const incResult = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddIcvGetbyid',
            headers: {
              'p_tender_id': temp_tender_id,
              'p_ora_project_id': temp_ora_project_id,
            },
          });

          if(incResult.body.items[0].created_by) {
            $variables.about.created_by = incResult.body.items[0].created_by || 'ADMIN';
            $variables.about.created_date = incResult.body.items[0].created_date || 'ADMIN';
            $variables.about.last_updated_by = incResult.body.items[0].last_updated_by || 'ADMIN';
            $variables.about.last_updated_date = incResult.body.items[0].last_updated_date || 'ADMIN';
            $variables.about.last_updated_login = incResult.body.items[0].last_updated_login || 'ADMIN';
          }

          if(incResult.body.count > 0) {
            $variables.addEditMode = 'EDIT';
            console.log("EDIT MODE: ", $variables.addEditMode);
          
            if (incResult.body && incResult.body.items && incResult.body.items[0]) {
              const rec = incResult.body.items[0];
            
              // Populate Panel 2 (editable) fields
              $variables.inCountryValueVar.pddIncId       = rec.pdd_inc_id;
              $variables.inCountryValueVar.percSme        = rec.perc_sme;
              $variables.inCountryValueVar.daysLeft       = rec.days_left;
              $variables.inCountryValueVar.percSmeMonth   = rec.perc_sme_month;
              $variables.inCountryValueVar.additionalInfo = rec.additional_info || '';
            }
            const response = await Actions.callRest(context, {
              endpoint: 'PDD/getPmispddIcvProjectdetailsGetbyid',
              headers: {
                'p_tender_id': temp_tender_id,
                'p_project_id': temp_ora_project_id,
              },
            });
            let temp_days_left = response.body.items[0].days_left;
             $variables.tempDaysLeft = temp_days_left === 0 ? 'Completed' : response.body.items[0].days_left;
          }

          else {
            // ADD mode: carry days_left from project info into the editable form
            $variables.inCountryValueVar.daysLeft = $variables.onloadData.daysLeft;
          }

      } catch (error) {
        console.error('vbEnterListener error:', error);
      }
    }
  }

  return vbEnterListener;
});