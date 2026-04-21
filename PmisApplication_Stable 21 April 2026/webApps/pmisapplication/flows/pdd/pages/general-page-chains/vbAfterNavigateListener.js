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

  class vbAfterNavigateListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{previousPage:string,previousPageParams:any,currentPage:string,currentPageParams:any}} params.event
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralGetbyid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      let temp_ora_project_id;

      if (response.body.count === 1) {
        /*
          Populate generalInfoVar with VIEW data (includes display names)
          $variables.generalInfoVar.tender_id = response.body.items[0].tender_id;
          $variables.generalInfoVar.tender_name = response.body.items[0].tender_name;
          $variables.generalInfoVar.tender_number = response.body.items[0].tender_number;
          $variables.generalInfoVar.ora_project_id = response.body.items[0].project_id;
          $variables.generalInfoVar.ora_project_name = response.body.items[0].project_name;
          $variables.generalInfoVar.ora_project_number = response.body.items[0].project_number;
          $variables.generalInfoVar.supplier_name = response.body.items[0].supplier_name;
        */

        // Map VIEW data to TABLE structure for POST payload (27 fields only, no display names)
        $variables.generalInfoVar = this.mapViewToTable(response.body.items[0]);
        // $variables.postPayloadVar = this.mapViewToTable(response.body.items[0]);
        // console.log("POST PAYLOAD VARIABLE: ", JSON.stringify($variables.postPayloadVar));
        console.log("PAYLOAD VARIABLE: ", JSON.stringify($variables.generalInfoVar));
        
        // ADDED: Encrypt ora_project_id in EDIT mode
        temp_ora_project_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.generalInfoVar.ora_project_id,
          },
        });
      }

      else if(response.body.count === 0) {
        const responseForCreateMode = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: {
            'x-session-id': $variables.pTenderId,
          },
        });
        $variables.generalInfoVar.tender_id = responseForCreateMode.body.items[0].tender_id;
        $variables.generalInfoVar.tender_name = responseForCreateMode.body.items[0].tender_name;
        $variables.generalInfoVar.tender_number = responseForCreateMode.body.items[0].tender_number;
        $variables.generalInfoVar.ora_project_id = responseForCreateMode.body.items[0].project_id;
        $variables.generalInfoVar.ora_project_name = responseForCreateMode.body.items[0].project_name;
        $variables.generalInfoVar.ora_project_number = responseForCreateMode.body.items[0].project_number;
        $variables.generalInfoVar.contractor_id = responseForCreateMode.body.items[0].supplier_id;
        $variables.generalInfoVar.supplier_name = responseForCreateMode.body.items[0].supplier_name;

        temp_ora_project_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.generalInfoVar.ora_project_id,
          },
        });
      }
      
      $variables.pNavCode = response.body.count === 1 ? 'EDIT' : 'CREATE';

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralLinedtlsGetbyid',
        headers: {
          'x-session-id': temp_ora_project_id,
        },
      });

      $variables.lineDetailsADP.data = response2.body.items;
      
    }

    /**
     * Maps VIEW data (38 fields) to TABLE structure (27 fields) for POST/PUT operations
     * Removes all display name fields and keeps only IDs
     * @param {Object} viewData - Data from VIEW with display names
     * @returns {Object} - Clean TABLE structure with only 27 fields
     */
    mapViewToTable(viewData) {
      if (!viewData) return {};
      
      return {
        general_id: viewData.general_id,
        object_version_num: viewData.object_version_num || 1,
        ora_project_id: viewData.ora_project_id,
        ora_project_number: viewData.ora_project_number,
        ora_project_name: viewData.ora_project_name,
        tender_id: viewData.tender_id,
        tender_number: viewData.tender_number,
        tender_name: viewData.tender_name,
        phase_of_contract_id: viewData.phase_of_contract_id,
        contractor_id: viewData.contractor_id,
        supplier_name: viewData.supplier_name,
        project_desc: viewData.project_desc,
        original_amount: viewData.original_amount ? parseFloat(viewData.original_amount) : 0,
        budget: viewData.budget ? parseFloat(viewData.budget) : 0,
        project_type_id: viewData.project_type_id,
        section_id: viewData.section_id,
        sector: viewData.sector,
        stage: viewData.stage,
        status_id: viewData.status_id,
        comments: viewData.comments,
        scope_of_work: viewData.scope_of_work,
        anticipated_contract_value: viewData.anticipated_contract_value ? parseFloat(viewData.anticipated_contract_value) : 0,
        source_of_fund_id: viewData.source_of_fund_id,
        potential_saving: viewData.potential_saving ? parseFloat(viewData.potential_saving) : 0,
        region_id: viewData.region_id,
        pmu: viewData.pmu ? parseFloat(viewData.pmu) : null,
        additional_info: viewData.additional_info,
        created_by: viewData.created_by,
        created_date: viewData.created_date,
        last_updated_by: viewData.last_updated_by,
        last_updated_date: viewData.last_updated_date,
        last_updated_login: viewData.last_updated_login
      };
    }

  }

  return vbAfterNavigateListener;
});