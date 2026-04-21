// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class vbEnterListener extends ActionChain {

//     /**
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       if ($variables.pNavCode === 'EDIT') {
//         await this.loadEditMode(context);
//       } else {
//         await this.loadCreateMode(context);
//       }

//       // ── BUDGET LINES INIT ────────────────────────────────────────
//       // Build dynamic table columns using the year from the header var
//       const year = $variables.postBudgetHdrVar ? $variables.postBudgetHdrVar.year : null;
//       console.log("Header Year: ", year);
//       $variables.lvBudgetTableColumns = $page.functions.buildBudgetColumns(year);
//       console.log(JSON.stringify($variables.lvBudgetTableColumns));

//       // In EDIT mode: load existing budget lines
//       if ($variables.pNavCode === 'EDIT') {
//         await Actions.callChain(context, { chain: 'SynBudgetLinesAC' });
//       }

//       // Set up BufferingDataProvider submittable change listener
//       $page.variables.bufferDPBudgetLines.instance.addEventListener('submittableChange', (event) => {
//         const submittableRows = event.detail;
//         const textarea = document.getElementById('bufferContent');
//         if (!textarea) return;
//         let textValue = '';
//         submittableRows.forEach((editItem) => {
//           textValue += 'Operation: ' + editItem.operation + ', ';
//           textValue += 'Line ID: ' + editItem.item.data.budget_control_line_id + '\n';
//         });
//         textarea.value = textValue;
//       });
//     }

//     /**
//      * @param {Object} context
//      */
//     async loadEditMode(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       const response = await Actions.callRest(context, {
//         endpoint: 'PDD/getPmispddBudgetcontrolGetbyhdrid',
//         headers: {
//           'x-session-id': $variables.pNavId,
//         },
//       });

//       $variables.postBudgetHdrVar = response.body.items[0];

//       // Also populate display fields from header
//       if (response.body.items[0]) {
//         $variables.postContractVar = {
//           ...$variables.postContractVar,
//           ora_project_name:   response.body.items[0].ora_project_name,
//           ora_project_number: response.body.items[0].ora_project_number,
//           tender_name:        response.body.items[0].tender_name,
//           tender_number:      response.body.items[0].tender_number,
//         };
//       }
//     }

//     /**
//      * @param {Object} context
//      */
//     async loadCreateMode(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       const response2 = await Actions.callRest(context, {
//         endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
//         headers: {
//           'x-session-id': $variables.pTenderId,
//         },
//       });

//       $variables.postContractVar.ora_project_name   = response2.body.items[0].project_name;
//       $variables.postContractVar.ora_project_number = response2.body.items[0].project_number;
//       $variables.postContractVar.tender_name        = response2.body.items[0].tender_name;
//       $variables.postContractVar.tender_number      = response2.body.items[0].tender_number;

//       $variables.postBudgetHdrVar.ora_project_id     = response2.body.items[0].project_id;
//       $variables.postBudgetHdrVar.ora_project_name   = response2.body.items[0].project_name;
//       $variables.postBudgetHdrVar.ora_project_number = response2.body.items[0].project_number;
//       $variables.postBudgetHdrVar.tender_id          = response2.body.items[0].tender_id;
//       $variables.postBudgetHdrVar.tender_name        = response2.body.items[0].tender_name;
//       $variables.postBudgetHdrVar.tender_number      = response2.body.items[0].tender_number;
//       $variables.postBudgetHdrVar.last_updated_by    = $application.user.email;
//       $variables.postBudgetHdrVar.created_by         = $application.user.email;
//       $variables.postBudgetHdrVar.last_updated_login = $application.user.email;
//     }
//   }

//   return vbEnterListener;
// });


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
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.pNavCode === 'EDIT') {
        await this.loadEditMode(context);
      } else {
        await this.loadCreateMode(context);
      }

      // ── BUDGET LINES INIT ────────────────────────────────────────
      // Build dynamic table columns using the year from the header var.
      // FIX: In CREATE mode, postBudgetHdrVar.year is not yet set at page enter
      // (the user selects the year via the Year LOV).  We therefore build columns
      // with whatever year is currently stored (null in CREATE → generic headers)
      // and rely on the Year LOV change-listener to rebuild columns once the user
      // picks a year.  In EDIT mode the year is loaded from the DB record above,
      // so columns are built with the correct year immediately.
      const year = ($variables.postBudgetHdrVar && $variables.postBudgetHdrVar.year)
                    ? $variables.postBudgetHdrVar.year
                    : null;
      console.log("Header Year: ", year);
      $variables.lvBudgetTableColumns = $page.functions.buildBudgetColumns(year);
      console.log(JSON.stringify($variables.lvBudgetTableColumns));

      // In EDIT mode: load existing budget lines
      if ($variables.pNavCode === 'EDIT') {
        await Actions.callChain(context, { chain: 'SynBudgetLinesAC' });
      }

      // Set up BufferingDataProvider submittable change listener
      $page.variables.bufferDPBudgetLines.instance.addEventListener('submittableChange', (event) => {
        const submittableRows = event.detail;
        const textarea = document.getElementById('bufferContent');
        if (!textarea) return;
        let textValue = '';
        submittableRows.forEach((editItem) => {
          textValue += 'Operation: ' + editItem.operation + ', ';
          textValue += 'Line ID: ' + editItem.item.data.budget_control_line_id + '\n';
        });
        textarea.value = textValue;
      });
    }

    /**
     * @param {Object} context
     */
    async loadEditMode(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddBudgetcontrolGetbyhdrid',
        headers: {
          'x-session-id': $variables.pNavId,
        },
      });

      $variables.postBudgetHdrVar = response.body.items[0];

      // Also populate display fields from header
      if (response.body.items[0]) {
        $variables.postContractVar = {
          ...$variables.postContractVar,
          ora_project_name:   response.body.items[0].ora_project_name,
          ora_project_number: response.body.items[0].ora_project_number,
          tender_name:        response.body.items[0].tender_name,
          tender_number:      response.body.items[0].tender_number,
        };
      }
    }

    /**
     * @param {Object} context
     */
    async loadCreateMode(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      $variables.postContractVar.ora_project_name   = response2.body.items[0].project_name;
      $variables.postContractVar.ora_project_number = response2.body.items[0].project_number;
      $variables.postContractVar.tender_name        = response2.body.items[0].tender_name;
      $variables.postContractVar.tender_number      = response2.body.items[0].tender_number;

      $variables.postBudgetHdrVar.ora_project_id     = response2.body.items[0].project_id;
      $variables.postBudgetHdrVar.ora_project_name   = response2.body.items[0].project_name;
      $variables.postBudgetHdrVar.ora_project_number = response2.body.items[0].project_number;
      $variables.postBudgetHdrVar.tender_id          = response2.body.items[0].tender_id;
      $variables.postBudgetHdrVar.tender_name        = response2.body.items[0].tender_name;
      $variables.postBudgetHdrVar.tender_number      = response2.body.items[0].tender_number;
      $variables.postBudgetHdrVar.last_updated_by    = $application.user.email;
      $variables.postBudgetHdrVar.created_by         = $application.user.email;
      $variables.postBudgetHdrVar.last_updated_login = $application.user.email;
      // NOTE: postBudgetHdrVar.year is intentionally NOT set here.
      // The user will select the year via the Year LOV on the form.
      // The Year LOV change-listener must call buildBudgetColumns(selectedYear)
      // and reassign $variables.lvBudgetTableColumns to update column headers.
    }
  }

  return vbEnterListener;
});