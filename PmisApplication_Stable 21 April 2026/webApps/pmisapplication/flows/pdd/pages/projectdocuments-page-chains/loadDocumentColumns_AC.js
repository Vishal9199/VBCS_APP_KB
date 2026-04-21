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

//   class loadDocumentColumns_AC extends ActionChain {

//     /**
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       const response = await Actions.callRest(context, {
//         endpoint: 'PAM/getCommonLovLookup',
//         headers: {
//           'p_lookup_type_code': 'PMIS_PDD_STATIC_DOCUMENTS',
//         },
//       });

//       $variables.ADPStaticDocs.data = response.body.items;

//       const response2 = await Actions.callRest(context, {
//         endpoint: 'PAM/getCommonLovLookup',
//         headers: {
//           'p_lookup_type_code': 'PMIS_PDD_DYNAMIC_DOCUMENTS',
//         },
//       });

//       $variables.ADPDynamicDocs.data = response2.body.items;

//       const response3 = await Actions.callRest(context, {
//         endpoint: 'PAM/getCommonLovLookup',
//         headers: {
//           'p_lookup_type_code': 'PMIS_PDD_OUTPUT_DOCUMENTS',
//         },
//       });

//       $variables.ADPOutputDocs.data = response3.body.items;

//       const response4 = await Actions.callRest(context, {
//         endpoint: 'PAM/getCommonLovLookup',
//         headers: {
//           'p_lookup_type_code': 'PMIS_PDD_OTHER_DOCUMENTS',
//         },
//       });

//       $variables.ADPOtherDocs.data = response4.body.items;

//       let enc_appCode = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: $variables.P_APPLICATION_CODE,
//         },
//       });

//       const response5 = await Actions.callRest(context, {
//         endpoint: 'PAM/postAttachmentSearch',
//         headers: {
//           'X-cache-applicationcode': enc_appCode,
//         },
//       });
//     }
//   }

//   return loadDocumentColumns_AC;
// });

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

//   class loadDocumentColumns_AC extends ActionChain {

//     /**
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       // ─────────────────────────────────────────────────────────────
//       // STEP 1: Load all 4 LOV category lists in parallel
//       // Each call returns the required document rows for that tab
//       // ─────────────────────────────────────────────────────────────
//       const [response, response2, response3, response4] = await Promise.all([
//         Actions.callRest(context, {
//           endpoint: 'PAM/getCommonLovLookup',
//           headers: { 'p_lookup_type_code': 'PMIS_PDD_STATIC_DOCUMENTS' },
//         }),
//         Actions.callRest(context, {
//           endpoint: 'PAM/getCommonLovLookup',
//           headers: { 'p_lookup_type_code': 'PMIS_PDD_DYNAMIC_DOCUMENTS' },
//         }),
//         Actions.callRest(context, {
//           endpoint: 'PAM/getCommonLovLookup',
//           headers: { 'p_lookup_type_code': 'PMIS_PDD_OUTPUT_DOCUMENTS' },
//         }),
//         Actions.callRest(context, {
//           endpoint: 'PAM/getCommonLovLookup',
//           headers: { 'p_lookup_type_code': 'PMIS_PDD_OTHER_DOCUMENTS' },
//         }),
//       ]);

//       const staticRows  = (response.body.items  || []);
//       const dynamicRows = (response2.body.items || []);
//       const outputRows  = (response3.body.items || []);
//       const otherRows   = (response4.body.items || []);

//       // ─────────────────────────────────────────────────────────────
//       // STEP 2: Encrypt app code and fetch all uploaded attachments
//       // ─────────────────────────────────────────────────────────────
//       const enc_appCode = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: $variables.P_APPLICATION_CODE },
//       });

//       const response5 = await Actions.callRest(context, {
//         endpoint: 'PAM/postAttachmentSearch',
//         headers: { 'X-cache-applicationcode': enc_appCode },
//       });

//       const allAttachments = (response5.body.P_OUTPUT || []);

//       // ─────────────────────────────────────────────────────────────
//       // STEP 3: Build a map: document_category → attachment count
//       //
//       //  Each LOV row has lookup_value_name (e.g. "Approved Project Charter From PAM")
//       //  Each attachment has document_category matching that name.
//       //  We count attachments per category so the badge shows the correct number.
//       // ─────────────────────────────────────────────────────────────
//       const countMap = {};
//       allAttachments.forEach(att => {
//         const cat = att.document_category;
//         if (cat) {
//           countMap[cat] = (countMap[cat] || 0) + 1;
//         }
//       });

//       console.log('[loadDocumentColumns_AC] Attachment count map:', JSON.stringify(countMap));

//       // ─────────────────────────────────────────────────────────────
//       // STEP 4: Merge attachment_count into each LOV row and set ADPs
//       //
//       //  We spread the original LOV row and append attachment_count.
//       //  The badge template: $current.row.attachment_count ?? 0
//       //  will now show the correct number.
//       // ─────────────────────────────────────────────────────────────
//       const mergeCount = (rows) =>
//         rows.map(row => ({
//           ...row,
//           attachment_count: countMap[row.lookup_value_name] || 0,
//         }));
      
//       const docDataMap = {};
//       allAttachments.forEach(att => {
//         const cat = att.document_category;
//       });
      
//       const mergeDocDetails = (rows) =>
//         rows.map(row => ({
//           ...row,
//           document_category: docDataMap[row.document_category] || null,
//           created_by: docDataMap[row.created_by] || null,
//           created_date: docDataMap[row.created_date] || null,
//         }));

//       $variables.ADPStaticDocs.data  = mergeCount(staticRows);
//       $variables.ADPStaticDocs.data  = mergeDocDetails(staticRows);
//       $variables.ADPDynamicDocs.data = mergeCount(dynamicRows);
//       $variables.ADPOutputDocs.data  = mergeCount(outputRows);
//       $variables.ADPOtherDocs.data   = mergeCount(otherRows);

//       console.log('[loadDocumentColumns_AC] Static rows loaded:',  staticRows.length,  '| Dynamic:', dynamicRows.length, '| Output:', outputRows.length, '| Other:', otherRows.length);
//       console.log('[loadDocumentColumns_AC] Total attachments:', allAttachments.length);
//     }
//   }

//   return loadDocumentColumns_AC;
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

  class loadDocumentColumns_AC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ─────────────────────────────────────────────────────────────
      // STEP 1: Load all 4 LOV category lists in parallel
      // Each returns the required document rows for that tab.
      // ─────────────────────────────────────────────────────────────
      const [response, response2, response3, response4] = await Promise.all([
        Actions.callRest(context, {
          endpoint: 'PAM/getCommonLovLookup',
          headers: { 'p_lookup_type_code': 'PMIS_PDD_STATIC_DOCUMENTS' },
        }),
        Actions.callRest(context, {
          endpoint: 'PAM/getCommonLovLookup',
          headers: { 'p_lookup_type_code': 'PMIS_PDD_DYNAMIC_DOCUMENTS' },
        }),
        Actions.callRest(context, {
          endpoint: 'PAM/getCommonLovLookup',
          headers: { 'p_lookup_type_code': 'PMIS_PDD_OUTPUT_DOCUMENTS' },
        }),
        Actions.callRest(context, {
          endpoint: 'PAM/getCommonLovLookup',
          headers: { 'p_lookup_type_code': 'PMIS_PDD_OTHER_DOCUMENTS' },
        }),
      ]);

      const staticRows  = (response.body.items  || []);
      const dynamicRows = (response2.body.items || []);
      const outputRows  = (response3.body.items || []);
      const otherRows   = (response4.body.items || []);

      // ─────────────────────────────────────────────────────────────
      // STEP 2: Encrypt app code and fetch all uploaded attachments
      // ─────────────────────────────────────────────────────────────
      const enc_appCode = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: $variables.P_APPLICATION_CODE },
      });
      const enc_transactionId = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: $variables.P_TRANSACTION_ID },
      });

      const response5 = await Actions.callRest(context, {
        endpoint: 'PAM/postAttachmentSearch',
        headers: {
          'X-cache-applicationcode': enc_appCode,
          'X-cache-transactionid': enc_transactionId,
        },
      });

      const allAttachments = (response5.body.P_OUTPUT || []);

      console.log('[loadDocumentColumns_AC] Total attachments fetched:', allAttachments.length);

      // ─────────────────────────────────────────────────────────────
      // STEP 3: Group attachments by document_category
      //
      //  Key   = document_category  (matches lookup_value_name in LOV)
      //  Value = array of attachment objects sorted newest-first
      // ─────────────────────────────────────────────────────────────
      const categoryMap = {};
      allAttachments.forEach(att => {
        const cat = att.document_category;
        if (!cat) return;
        if (!categoryMap[cat]) {
          categoryMap[cat] = [];
        }
        categoryMap[cat].push(att);
      });

      // Sort each bucket newest-first by created_date
      Object.keys(categoryMap).forEach(cat => {
        categoryMap[cat].sort((a, b) =>
          new Date(b.created_date) - new Date(a.created_date)
        );
      });

      // ─────────────────────────────────────────────────────────────
      // STEP 4: Merge attachment details into each LOV row
      //
      //  attachment_count    — number of files uploaded for this category
      //  latest_doc_name     — document_name of the most recent upload
      //  latest_type         — type  (FILE / URL / TEXT)
      //  latest_mime         — document_type (MIME string e.g. "image/png")
      //  latest_description  — description
      //  latest_created_by   — created_by (email)
      //  latest_created_date — created_date (ISO datetime)
      //
      //  If no attachments uploaded yet, fields default to empty string.
      // ─────────────────────────────────────────────────────────────
      const mergeAttachmentDetails = (rows) =>
        rows.map(row => {
          const uploads = categoryMap[row.lookup_value_code] || [];
          const latest  = uploads[0] || null;

          return {
            ...row,
            attachment_count:    uploads.length,
            latest_doc_name:     latest ? (latest.document_name   || '') : '',
            latest_type:         latest ? (latest.type            || '') : '',
            latest_mime:         latest ? (latest.document_type   || '') : '',
            latest_description:  latest ? (latest.description     || '') : '',
            latest_created_by:   latest ? (latest.created_by      || '') : '',
            latest_created_date: latest ? (latest.created_date    || '') : '',
          };
        });

      $variables.ADPStaticDocs.data  = mergeAttachmentDetails(staticRows);
      $variables.ADPDynamicDocs.data = mergeAttachmentDetails(dynamicRows);
      $variables.ADPOutputDocs.data  = mergeAttachmentDetails(outputRows);
      $variables.ADPOtherDocs.data   = mergeAttachmentDetails(otherRows);

      console.log('[loadDocumentColumns_AC] Static:', staticRows.length, '| Dynamic:', dynamicRows.length,
        '| Output:', outputRows.length, '| Other:', otherRows.length);
    }
  }

  return loadDocumentColumns_AC;
});