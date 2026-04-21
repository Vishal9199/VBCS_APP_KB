define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbAfterNavigateListener extends ActionChain {
    async run(context) {
      const { $page, $application, $variables } = context;
      try {
        await Actions.callComponentMethod(context, { selector: '#loadingDialog', method: 'open' });

        console.log('📤 Projectlist SearchObj:', JSON.stringify($variables.searchObj, null, 2));

        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.searchObj },
        });
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postProjectListSearch',
          body: { payload: enc_payload },
        });

        console.log('📥 Response status:', response.body.OUT_STATUS);
        console.log('📊 Total records:', response.body.OUT_TOTAL_COUNT);

        $variables.projectlistADP.data = response.body.P_OUTPUT || [];
        $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;

        const offset = parseInt($variables.searchObj.in_offset, 10) || 0;
        const limit  = parseInt($variables.searchObj.in_limit,  10) || 10;
        $variables.currentPage = Math.floor(offset / limit) + 1;

        await Actions.fireDataProviderEvent(context, { target: $variables.projectlistADP, refresh: null });

        $variables.pagination.is_next = response.body.OUT_HAS_NEXT === 'Y' ? false : true;
        $variables.pagination.is_prev = offset <= 0 ? true : false;

        await Actions.callComponentMethod(context, { selector: '#loadingDialog', method: 'close' });
        $variables.vShowFragment = true;

        console.log('✅ Projectlist search complete. Page:', $variables.currentPage, 'Total:', $variables.totalRecords);

      } catch (err) {
        console.error('❌ Error in Projectlist vbAfterNavigateListener:', err);
        try { await Actions.callComponentMethod(context, { selector: '#loadingDialog', method: 'close' }); } catch(e) {}
        await Actions.fireNotificationEvent(context, {
          summary: 'Projectlist Search Error',
          message: 'Failed to load data: ' + err.message,
          type: 'error', displayMode: 'persist'
        });
      }
    }
  }

  return vbAfterNavigateListener;
});