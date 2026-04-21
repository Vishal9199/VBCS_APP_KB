// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (ActionChain, Actions, ActionUtils) => {
//   'use strict';

//   class loadProjectlistData extends ActionChain {
//     async run(context, { encryptedId }) {
//       const { $variables } = context;
//       try {
//         // FIX: was 'PDD/getProjectListDetail' — corrected to match operationId from openapi3.json
//         const response = await Actions.callRest(context, {
//           endpoint: 'PDD/getPmispddProjectlistGetbyid',
//           headers: { 'x-session-id': encryptedId },
//         });

//         if (response.status === 200 && response.body) {
//           const rec = Array.isArray(response.body.items) ? response.body.items[0] : response.body;

//           if (rec) {
//             $variables.projectlistHeaderVar = { ...rec };

//             console.log("Tender ID: ", JSON.stringify($variables.projectlistHeaderVar));
            
//             // FIX: about data was never populated from the response

//             $variables.projectlistHeaderVar.ora_project_id = response.body.items[0].ora_project_id;
//             // Map audit fields into the about variable for the About dialog
//             $variables.about = {
//               created_by:       rec.created_by        || '',
//               creation_date:    rec.created_date       || '',
//               last_updated_by:  rec.last_updated_by    || '',
//               last_update_date: rec.last_updated_date  || '',
//               last_update_login: rec.last_updated_login || ''
//             };

//             await Actions.fireDataProviderEvent(context, {
//               refresh: null,
//               target: $variables.oraProjectLovSDP,
//             });
//           } else {
//             await Actions.fireNotificationEvent(context, {
//               summary: 'Warning',
//               message: 'No record found for the given ID.',
//               type: 'warning',
//               displayMode: 'transient'
//             });
//           }
//         } else {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Error',
//             message: 'Failed to load record.',
//             type: 'error',
//             displayMode: 'persist'
//           });
//         }
//       } catch (err) {
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Error',
//           message: 'Load failed: ' + err.message,
//           type: 'error',
//           displayMode: 'persist'
//         });
//       }
//     }
//   }

//   return loadProjectlistData;
// });

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class loadProjectlistData extends ActionChain {
    async run(context, { encryptedId }) {
      const { $variables } = context;
      try {
        console.log('=== LOAD PROJECT LIST DATA START ===');
        console.log('Encrypted ID:', encryptedId);

        // Call REST endpoint to get project list details
        const response = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddProjectlistGetbyid',
          headers: { 'x-session-id': encryptedId },
        });

        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(response.body, null, 2));

        if (response.status === 200 && response.body) {
          // Extract the record from items array
          const rec = Array.isArray(response.body.items) && response.body.items.length > 0 
            ? response.body.items[0] 
            : null;

          if (rec) {
            console.log('Record Found:', JSON.stringify(rec, null, 2));

            // ✅ FIX 1: Set all fields using spread operator
            $variables.projectlistHeaderVar = {
              pdd_project_id: rec.pdd_project_id,
              object_version_num: rec.object_version_num,
              project_id: rec.project_id,
              ora_project_id: rec.ora_project_id,
              tender_id: rec.tender_id,
              additional_info: rec.additional_info,
              created_by: rec.created_by,
              created_date: rec.created_date,
              last_updated_by: rec.last_updated_by,
              last_updated_date: rec.last_updated_date,
              last_updated_login: rec.last_updated_login
            };

            console.log('projectlistHeaderVar Set:', JSON.stringify($variables.projectlistHeaderVar, null, 2));

            // ✅ FIX 2: Populate about variable for About dialog
            $variables.about = {
              created_by: rec.created_by || '',
              creation_date: rec.created_date || '',
              last_updated_by: rec.last_updated_by || '',
              last_update_date: rec.last_updated_date || '',
              last_update_login: rec.last_updated_login || ''
            };

            console.log('About Variable Set:', JSON.stringify($variables.about, null, 2));

            // ✅ FIX 3: Force LOV refresh to ensure dropdowns show display values
            // This ensures the LOV data is fetched and the selected values are properly displayed
            if ($variables.oraProjectLovSDP) {
              await Actions.fireDataProviderEvent(context, {
                target: $variables.oraProjectLovSDP,
                refresh: null
              });
              console.log('ORA Project LOV refreshed');
            }

            if ($variables.projectLovSDP) {
              await Actions.fireDataProviderEvent(context, {
                target: $variables.projectLovSDP,
                refresh: null
              });
              console.log('Project LOV refreshed');
            }

            // Success notification
            // await Actions.fireNotificationEvent(context, {
            //   summary: 'Success',
            //   message: 'Project list details loaded successfully.',
            //   type: 'confirmation',
            //   displayMode: 'transient'
            // });

            console.log('=== LOAD PROJECT LIST DATA SUCCESS ===');

          } else {
            // No record found
            console.warn('No record found in response items array');
            await Actions.fireNotificationEvent(context, {
              summary: 'Warning',
              message: 'No record found for the given ID.',
              type: 'warning',
              displayMode: 'transient'
            });
          }
        } else {
          // Failed response
          console.error('Failed response:', response.status, response.body);
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Failed to load record. Status: ' + response.status,
            type: 'error',
            displayMode: 'persist'
          });
        }
      } catch (err) {
        // Exception handling
        console.error('Load Project List Data Error:', err);
        console.error('Error Stack:', err.stack);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Load failed: ' + err.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return loadProjectlistData;
});