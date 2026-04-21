// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (ActionChain, Actions, ActionUtils) => {
//   'use strict';

//   class vbAfterNavigateListener extends ActionChain {
//     async run(context) {
//       const { $page, $variables } = context;
//       try {
//         const pNavCode = $page.variables.pNavCode;
//         const pNavId   = $page.variables.pNavId;
//         console.log('PAGE INIT | pNavCode:', pNavCode, '| pNavId:', pNavId);

//         if (pNavCode === 'EDIT') {
//           if (!pNavId || pNavId === '0') {
//             await Actions.fireNotificationEvent(context, { summary:'Error', message:'Invalid navigation: EDIT mode requires a valid ID', type:'error', displayMode:'persist' });
//             return;
//           }
//           await Actions.callChain(context, { chain: 'loadProjectlistData', params: { encryptedId: pNavId } });

//         } else if (pNavCode === 'CREATE') {
//           await Actions.resetVariables(context, { variables: ['$variables.projectlistHeaderVar'] });
//         } else {
//           await Actions.fireNotificationEvent(context, { summary:'Error', message:'Invalid navigation code: ' + pNavCode, type:'error', displayMode:'persist' });
//         }
//       } catch (err) {
//         await Actions.fireNotificationEvent(context, { summary:'Error', message:'Page init failed: ' + err.message, type:'error', displayMode:'transient' });
//       }
//     }
//   }

//   return vbAfterNavigateListener;
// });



define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class vbAfterNavigateListener extends ActionChain {
    async run(context) {
      const { $page, $variables } = context;
      try {
        const pNavCode = $page.variables.pNavCode;
        const pNavId = $page.variables.pNavId;
        
        console.log('=== PAGE INIT START ===');
        console.log('Navigation Code (pNavCode):', pNavCode);
        console.log('Navigation ID (pNavId):', pNavId);
        console.log('Current projectlistHeaderVar:', JSON.stringify($variables.projectlistHeaderVar, null, 2));

        if (pNavCode === 'EDIT') {
          // Validate ID
          if (!pNavId || pNavId === '0' || pNavId === 0) {
            console.error('Invalid ID for EDIT mode:', pNavId);
            await Actions.fireNotificationEvent(context, {
              summary: 'Error',
              message: 'Invalid navigation: EDIT mode requires a valid ID',
              type: 'error',
              displayMode: 'persist'
            });
            return;
          }

          console.log('Loading data for EDIT mode with ID:', pNavId);
          
          // Call the load chain
          await Actions.callChain(context, {
            chain: 'loadProjectlistData',
            params: { encryptedId: pNavId }
          });

          console.log('After loadProjectlistData - projectlistHeaderVar:', JSON.stringify($variables.projectlistHeaderVar, null, 2));

        } else if (pNavCode === 'CREATE') {
          console.log('Resetting variables for CREATE mode');
          
          // Reset the main variable for CREATE mode
          await Actions.resetVariables(context, {
            variables: ['$variables.projectlistHeaderVar']
          });

          console.log('After reset - projectlistHeaderVar:', JSON.stringify($variables.projectlistHeaderVar, null, 2));

          await Actions.fireNotificationEvent(context, {
            summary: 'Info',
            message: 'Ready to create new project list entry.',
            type: 'info',
            displayMode: 'transient'
          });

        } else {
          // Invalid navigation code
          console.error('Invalid navigation code:', pNavCode);
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: 'Invalid navigation code: ' + pNavCode,
            type: 'error',
            displayMode: 'persist'
          });
        }

        console.log('=== PAGE INIT END ===');

      } catch (err) {
        console.error('Page Init Error:', err);
        console.error('Error Stack:', err.stack);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Page init failed: ' + err.message,
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return vbAfterNavigateListener;
});