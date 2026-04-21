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

  class load_mandatory_ref_doc extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // Step 1: Fetch mandatory reference document lookup list
      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getCommonLovLookup',
        headers: {
          'p_lookup_type_code': 'PMIS_PROJECT_CHARTER_MANDATORY_REF_DOC',
        },
      });

      const items = (response.body.items || []);

      // Step 2: Fetch uploaded attachments for this project charter (edit mode only)
      let categoryCountMap = {};

      if ($variables.projectCharterId) {
        try {
          const enc_appCode = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: $variables.P_APPLICATION_CODE },
          });
          const enc_transactionId = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: String($variables.projectCharterId) },
          });

          const searchResponse = await Actions.callRest(context, {
            endpoint: 'PAM/postAttachmentSearch',
            headers: {
              'X-cache-applicationcode': enc_appCode,
              'X-cache-transactionid': enc_transactionId,
            },
          });

          const allAttachments = (searchResponse.body.P_OUTPUT || []);

          allAttachments.forEach(att => {
            const cat = att.document_category;
            if (cat) {
              categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
            }
          });
        } catch (err) {
          console.warn('[load_mandatory_ref_doc] Could not fetch attachments:', err);
        }
      }

      // Step 3: Merge attachment_count into each lookup row
      const mergedItems = items.map(row => ({
        ...row,
        attachment_count: categoryCountMap[row.lookup_value_code] || 0,
      }));

      // Step 4: Push to the ArrayDataProvider
      $variables.mandatoryRefDocADP.data = mergedItems;
    }
  }

  return load_mandatory_ref_doc;
});