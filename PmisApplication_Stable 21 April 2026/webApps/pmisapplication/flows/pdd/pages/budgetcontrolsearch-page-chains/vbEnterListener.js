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

      // FIX: in_offset has no defaultValue in page JSON — starts as empty string
      // Must be set before first search or ORDS receives empty string for offset
      if (!$variables.searchObj.in_offset) $variables.searchObj.in_offset = '0';
      if (!$variables.searchObj.in_limit)  $variables.searchObj.in_limit  = '10';

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
        headers: {
          'x-session-id': $variables.pTenderId,
        },
      });

      // FIX: Null safety — was accessing items[0] directly, crashes if items is empty
      if (!response.body.items || response.body.items.length === 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Project / Tender details not found.',
          displayMode: 'transient',
          type: 'error',
        });
        return;
      }

      $variables.projectDetail             = response.body.items[0];
      $variables.searchObj.p_tender_id     = response.body.items[0].tender_id;

      // Disable both buttons during fetch
      $variables.pagination.is_prev = true;
      $variables.pagination.is_next = true;

      let enc_search_obj = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.searchObj,
        },
      });

      const response2 = await Actions.callRest(context, {
        endpoint: 'PDD/postPmispddBudgetcontrolhdrSearch',
        body: {
          payload: enc_search_obj,
        },
      });

      $variables.budgetControlADP.data = response2.body.P_OUTPUT;

      const totalCount   = Number(response2.body.OUT_TOTAL_COUNT || 0);
      const currentCount = Number(response2.body.OUT_COUNT || 0);
      const hasNext      = response2.body.OUT_HAS_NEXT || 'N';
      const offset       = parseInt($variables.searchObj.in_offset, 10) || 0;
      const limit        = parseInt($variables.searchObj.in_limit,  10) || 10;

      // Update pagination object
      $variables.pagination.offset        = offset;
      $variables.pagination.limit         = limit;
      $variables.pagination.total_records = totalCount;
      $variables.pagination.has_next      = hasNext;   // nextPageAction reads this
      $variables.pagination.current_page  = Math.floor(offset / limit) + 1;

      // Update pagination display
      if (totalCount > 0) {
        const startRecord = offset + 1;
        const endRecord   = Math.min(offset + currentCount, totalCount);
        $variables.paginationDisplay = `(${startRecord}-${endRecord} of ${totalCount} items)`;
      } else {
        $variables.paginationDisplay = '(0-0 of 0 items)';
      }

      // Update button disabled states
      $variables.pagination.is_next = hasNext !== 'Y'; // true = disabled
      $variables.pagination.is_prev = offset <= 0;     // true = disabled

      console.log('📄 Pagination:', $variables.paginationDisplay);
      console.log('   Prev disabled:', $variables.pagination.is_prev, '| Next disabled:', $variables.pagination.is_next);

    }
  }

  return vbEnterListener;
});