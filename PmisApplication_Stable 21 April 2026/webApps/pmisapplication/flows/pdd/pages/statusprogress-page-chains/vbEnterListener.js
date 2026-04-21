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

      try {
        const response2 = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: {
            'x-session-id': $variables.pTenderId,
          },
        });

        $variables.headerInfoVar.projectName = response2.body.items[0].project_name;
        $variables.headerInfoVar.projectNumber = response2.body.items[0].project_number;
        $variables.headerInfoVar.tenderNumber = response2.body.items[0].tender_number;

        $variables.getStatusprogressbyperiodVar.ora_project_name = $variables.headerInfoVar.projectName;
        $variables.getStatusprogressbyperiodVar.ora_project_number = $variables.headerInfoVar.projectNumber;
        $variables.getStatusprogressbyperiodVar.tender_number = $variables.headerInfoVar.tenderNumber;
        $variables.getStatusprogressbyperiodVar.period = $variables.periodName;

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddStatusprogressGetbyperiod',
          uriParams: {
            'p_period': $variables.periodName,
            'p_project_id': response2.body.items[0].project_id,
            'p_tender_id': response2.body.items[0].tender_id,
          },
        });

        if (response.body.count === 0) {
          $variables.pNavCode = 'CREATE';
          $variables.pNavId = '0';
        } else {
          $variables.getStatusprogressbyperiodVar = response.body.items[0];
          $variables.pNavCode = 'EDIT';
          $variables.pNavId = response.body.items[0].progress_id; // ← set FIRST
        }

        // ✅ Now call attachment load AFTER pNavId is correctly set
        await Actions.callChain(context, {
          chain: 'onloadAttachmentAC',
        });

      } catch (error) {
        console.error('vbEnterListener error:', error);
      }
    }
  }

  return vbEnterListener;
});