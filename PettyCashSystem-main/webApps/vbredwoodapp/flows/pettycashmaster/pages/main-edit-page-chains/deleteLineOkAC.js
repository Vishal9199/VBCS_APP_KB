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

//   class deleteLineOkAC extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {object} params.event
//      * @param {any} params.originalEvent
//      * @param {string} params.lineType
//      */
//     async run(context, { event, originalEvent, lineType }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       let temp_key = $variables.passLineType_id;
//       let temp_method = 'DELETE';
//       let temp_payload;

//       temp_key = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: temp_key,
//         },
//       });

//       temp_method = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: {
//           input: temp_method,
//         },
//       });

//       console.log("+++++++1Line Type: ", lineType);

//       if (lineType === 'claimLine') {
//         temp_payload = await Actions.callChain(context, {
//           chain: 'application:encryptAC',
//           params: {
//             input: $variables.claimLineForm_Delete,
//           },
//         });
//         const response = await Actions.callRest(context, {
//           endpoint: 'ORDS/postPettycashLineProcess',
//           headers: {
//             'x-session-code': temp_method,
//             'x-session-id': temp_key,
//           },
//           body: {"payload": temp_payload },
//         });

//         if (response.body.P_ERR_CODE === 'S') {

//           const deleteDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#deleteDialog',
//             method: 'close',
//           });

//           await Actions.fireDataProviderEvent(context, {
//             target: $variables.claimLineADP,
//             refresh: null,
//           });
//         }

//         await Actions.fireNotificationEvent(context, {
//           summary: response.body.P_ERR_MSG,
//           displayMode: 'transient',
//           type: response.body.P_ERR_CODE === 'S' ? 'success' : 'error',
//         });
//       } else {
//           temp_payload = await Actions.callChain(context, {
//             chain: 'application:encryptAC',
//             params: {
//               input: $variables.receiptLineForm_Delete,
//             },
//           });
//          const response2 = await Actions.callRest(context, {
//            endpoint: 'ORDS/postPettycashReceiptProcess',
//            headers: {
//              'x-session-id': temp_key,
//              'x-session-code': temp_method,
//            },
//            body: { "payload": temp_payload },
//          });

//         if (response2.body.P_ERR_CODE === 'S') {
        
//           const deleteDialogClose = await Actions.callComponentMethod(context, {
//             selector: '#deleteDialog',
//             method: 'close',
//           });
        
//           await Actions.fireDataProviderEvent(context, {
//             target: $variables.receiptLineADP,
//             refresh: null,
//           });
//         }

//         await Actions.fireNotificationEvent(context, {
//           summary: response2.body.P_ERR_MSG,
//           displayMode: 'transient',
//           type: response2.body.P_ERR_CODE === 'S' ? 'success' : 'error',
//         });
//       }

//     }
//   }

//   return deleteLineOkAC;
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

//   class deleteLineOkAC extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {object} params.event
//      * @param {any} params.originalEvent
//      * @param {string} params.lineType
//      */
//     async run(context, { event, originalEvent, lineType }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       console.log("+++++++1Line Type: ", lineType);

//       // Encrypt session credentials
//       const encryptedKey = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: $variables.passLineType_id },
//       });

//       const encryptedMethod = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: 'DELETE' },
//       });

//       // Determine endpoint and payload based on line type
//       const isClaimLine = lineType === 'claimLine';
//       const endpoint = isClaimLine ? 'ORDS/postPettycashLineProcess' : 'ORDS/postPettycashReceiptProcess';
//       const payloadSource = isClaimLine ? $variables.claimLineForm_Delete : $variables.receiptLineForm_Delete;
//       const targetADP = isClaimLine ? $variables.claimLineADP : $variables.receiptLineADP;

//       // Encrypt payload
//       const encryptedPayload = await Actions.callChain(context, {
//         chain: 'application:encryptAC',
//         params: { input: payloadSource },
//       });

//       // Call REST endpoint
//       const response = await Actions.callRest(context, {
//         endpoint: endpoint,
//         headers: {
//           'x-session-id': encryptedKey,
//           'x-session-code': encryptedMethod,
//         },
//         body: { payload: encryptedPayload },
//       });

//       // Handle successful deletion
//       if (response.body.P_ERR_CODE === 'S') {
//         await Actions.callComponentMethod(context, {
//           selector: '#deleteDialog',
//           method: 'close',
//         });

//         await Actions.callChain(context, {
//           chain: 'loadLineTablesAC',
//           params: {
//             'key_param': $variables.payload.claim_header_id,
//           },
//         });

//         // await Actions.fireDataProviderEvent(context, {
//         //   target: targetADP,
//         //   refresh: null,
//         // });
//       }

//       // Fire notification
//       await Actions.fireNotificationEvent(context, {
//         summary: response.body.P_ERR_MSG,
//         displayMode: 'transient',
//         type: response.body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
//       });
//     }
//   }

//   return deleteLineOkAC;
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

  class deleteLineOkAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {string} params.lineType
     */
    async run(context, { event, originalEvent, lineType }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      console.log("+++++++1Line Type: ", lineType);

      // Encrypt session credentials
      const encryptedKey = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: $variables.passLineType_id },
      });

      const encryptedMethod = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: 'DELETE' },
      });

      // Determine endpoint and payload based on line type
      const isClaimLine = lineType === 'claimLine';
      const endpoint = isClaimLine ? 'ORDS/postPettycashLineProcess' : 'ORDS/postPettycashReceiptProcess';
      const payloadSource = isClaimLine ? $variables.claimLineForm_Delete : $variables.receiptLineForm_Delete;

      // DEBUG: Log the payload BEFORE encryption to see what's being sent
      console.log("+++++++2Payload Source (" + lineType + "):", JSON.stringify(payloadSource));
      console.log("+++++++3Passline_id:", $variables.passLineType_id);

      // Encrypt payload
      const encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: { input: payloadSource },
      });

      // Call REST endpoint
      const response = await Actions.callRest(context, {
        endpoint: endpoint,
        headers: {
          'x-session-id': encryptedKey,
          'x-session-code': encryptedMethod,
        },
        body: { payload: encryptedPayload },
      });

      console.log("+++++++4Backend Response:", JSON.stringify(response.body));

      // Handle successful deletion
      if (response.body.P_ERR_CODE === 'S') {
        await Actions.callComponentMethod(context, {
          selector: '#deleteDialog',
          method: 'close',
        });

        // Reload both tables with fresh data
        await Actions.callChain(context, {
          chain: 'loadLineTablesAC',
          params: {
            'key_param': $variables.payload.claim_header_id,
          },
        });
      }

      // Fire notification
      await Actions.fireNotificationEvent(context, {
        summary: response.body.P_ERR_MSG,
        displayMode: 'transient',
        type: response.body.P_ERR_CODE === 'S' ? 'confirmation' : 'error',
      });
    }
  }

  return deleteLineOkAC;
});