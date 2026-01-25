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

  class ok_createBtn_AC extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $variables } = context;

      // $variables.postTenderVar_Normal.comments = $variables.postPayloadVarVar.comments;
      // $variables.postTenderVar_Normal.contract_holder_id = $variables.postPayloadVarVar.contract_holder_id;
      // $variables.postTenderVar_Normal.contract_owner_id = $variables.postPayloadVarVar.contract_owner_id;

      // $variables.postTenderVar_Normal.created_by = $variables.postPayloadVarVar.created_by;
      // $variables.postTenderVar_Normal.created_date = $variables.postPayloadVarVar.created_date;
      // $variables.postTenderVar_Normal.currency = $variables.postPayloadVarVar.currency;
      // $variables.postTenderVar_Normal.last_updated_by = $variables.postPayloadVarVar.last_updated_by;
      // $variables.postTenderVar_Normal.last_updated_date = $variables.postPayloadVarVar.last_updated_date;
      // $variables.postTenderVar_Normal.last_updated_login = $variables.postPayloadVarVar.last_updated_login;
      // $variables.postTenderVar_Normal.object_version_num = $variables.postPayloadVarVar.object_version_num || 0;

      // $variables.postTenderVar_Normal.person_id = $variables.postPayloadVarVar.person_id;
      // $variables.postTenderVar_Normal.pr_estimated_value = $variables.postPayloadVarVar.pr_estimated_value;

      // Currently hardcoding the pr_number because it will come from SAAS LOV.
      // $variables.postTenderVar_Normal.pr_number = $variables.postPayloadVarVar.pr_number || 'PR-001-13-12-2025';
      // $variables.postTenderVar_Normal.pr_title = $variables.postPayloadVarVar.pr_title || 'PR-ABC-Title-001';

      // $variables.postTenderVar_Normal.procurement_plan = $variables.postPayloadVarVar.procurement_plan;
      // $variables.postTenderVar_Normal.request_date = $variables.postPayloadVarVar.request_date;
      // $variables.postTenderVar_Normal.request_number = $variables.postPayloadVarVar.request_number;
      // $variables.postTenderVar_Normal.scm_team = $variables.postPayloadVarVar.scm_team;

      // $variables.postTenderVar_Normal.status_id = $variables.postPayloadVarVar.status_id;
      // $variables.postTenderVar_Normal.strategy_hdr_id = $variables.postPayloadVarVar.strategy_hdr_id;

      // $variables.postTenderVar_Normal.tender_category = $variables.postPayloadVarVar.tender_category;
      // $variables.postTenderVar_Normal.tender_category_des = $variables.postPayloadVarVar.tender_category_des;
      // $variables.postTenderVar_Normal.tender_committe = $variables.postPayloadVarVar.tender_committe;
      // $variables.postTenderVar_Normal.tender_type = $variables.postPayloadVarVar.tender_type;
      
      // Default Values are mapped in the variables tab.

      let temp_payload = await Actions.callChain(context, {
        chain: 'application:encryptLargePayloadWithTime',
        params: {
          plainText: $variables.postTenderVar_Normal,
        },
      });

      $variables.encPayload.payload = temp_payload;

      try {
        // --- REST CALL ---
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postTenderStrategyProcess2',
          headers: {
            'X-session-code': $variables.passMethod || '',
            'X-session-id': $variables.currentRow_Key || '',
          },
          body: $variables.encPayload,
        });

        const body = response?.body || {};

        // --- SAFELY FETCH SESSION HEADER (multiple case checks) ---
        const header_key = 
          response.headers.get('X-session-id') ||
          response.headers.get('x-session-id') ||
          response.headers.get('X-Session-id') ||
          response.headers.get('X-Session-Id') ||
          '';

        // --- SUCCESS ---
        if (body.P_ERR_CODE === 'S') {
          // await Actions.fireNotificationEvent(context, {
          //   summary: body.P_ERR_MSG || 'Success',
          //   displayMode: 'transient',
          //   type: 'confirmation',
          // });
        } 
        // --- FAILURE ---
        else {
          await Actions.fireNotificationEvent(context, {
            summary: body.P_ERR_MSG || 'Error occurred during process',
            displayMode: 'transient',
            type: 'error',
          });
        }

        // --- ALWAYS CLOSE DIALOG ---
        await Actions.callComponentMethod(context, {
          selector: '#tenderDialog',
          method: 'close',
        });

        // --- Navigate ONLY IF SUCCESS ---
        if (body.P_ERR_CODE === 'S') {
          await Actions.navigateToPage(context, {
            page: 'tender-edit',
            params: {
              pNavId: header_key,
            },
          });
        }

      } catch (err) {
        console.error('Error in postTenderStrategyProcess2:', err);

        // --- ERROR NOTIFICATION ---
        await Actions.fireNotificationEvent(context, {
          summary: 'Something went wrong while creating process.',
          displayMode: 'transient',
          type: 'error',
        });

        // --- CLOSE DIALOG IN ERROR CASE ---
        await Actions.callComponentMethod(context, {
          selector: '#tenderDialog',
          method: 'close',
        });
      }
    }
  }

  return ok_createBtn_AC;
});