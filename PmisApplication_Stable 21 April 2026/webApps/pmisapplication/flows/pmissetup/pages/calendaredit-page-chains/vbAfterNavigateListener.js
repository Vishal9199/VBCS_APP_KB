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


      try {

        if ($variables.pNavCode === 'EDIT') {

          const response2 = await Actions.callRest(context, {
            endpoint: 'PmisSetup/getPmisCalendarDtl',
            headers: {
              'x-session-id': $variables.pNavId,
            },
          });

          if (response2.body.count === 1) {

            $variables.calendarHeaderVar = response2.body.items[0];
          } else {
             await Actions.fireNotificationEvent(context, {
               summary: 'Failed to load header data. REST API error.',
               displayMode: 'transient',
               type: 'warning',
             });
          }

          // const response = await Actions.callRest(context, {
          //   endpoint: 'PmisSetup/getPmisCalendarLineDtl',
          //   headers: {
          //     'x-session-id': $variables.pNavId,
          //   },
          // });


          $variables.searchObj.p_hdr_id = response2.body.items[0].cal_hdr_id;


          let enc_payload = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.searchObj,
            },
          });
          

          const response = await Actions.callRest(context, {
            endpoint: 'PmisSetup/postPmisCalendarLineSearch',
            body: {"payload": enc_payload},
          });

          if (response.body.OUT_COUNT >= 1) {
            $variables.ADPcalendarLines.data = response.body.P_OUTPUT;
            $variables.totalRecords = response.body.OUT_TOTAL_COUNT;

            if (response.body.OUT_HAS_NEXT === 'Y') {
              $variables.pagination.is_next = false;
            } else {
              $variables.pagination.is_next = true;
            }

            if ($variables.searchObj.in_offset === '0') {
              $variables.pagination.is_prev = true;
            } else {
              $variables.pagination.is_prev = false;
            }
          }
        }
      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: error.message,
        });
      } finally {
      }
    }
  }

  return vbAfterNavigateListener;
});
