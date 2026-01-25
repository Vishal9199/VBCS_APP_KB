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
//      * OnLoad
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables, $functions } = context;

//       await $application.functions.reorderFilterChips();

//       let encryptJs = await Actions.callChain(context, {
//         chain: 'application:encryptLargePayloadWithTime',
//         params: {
//           plainText: $variables.SearchObj,
//         },
//       });

//       console.log("++++1 searchObj: ", encryptJs);

//       $variables.encSearchObj.payload = encryptJs;

//   const response = await Actions.callRest(context, {
//     endpoint: 'ORDS/post_Nws_Search',
//     body: $variables.encSearchObj,
//   });

//       $variables.tableHeaderADP.data = response.body.P_OUTPUT;
//       $variables.totalRecords = response.body.OUT_TOTAL_COUNT;

//       // ✅ CALCULATE CURRENT PAGE
//       const offset = parseInt($variables.SearchObj.in_offset, 10);
//       const limit = parseInt($variables.SearchObj.in_limit, 10);
//       $variables.currentPage = Math.floor(offset / limit) + 1;

//       console.log("📄 Current Page:", $variables.currentPage);
//       console.log("📊 Records on page:", $variables.tableHeaderADP.data.length);
//       console.log("📈 Total records:", $variables.totalRecords);

//       await Actions.fireDataProviderEvent(context, {
//         target: $variables.tableHeaderADP,
//         refresh: null,
//       });


//       if (response.body.OUT_HAS_NEXT === 'Y') {
//         $variables.pagination.is_next = false;
//       } else {
//         $variables.pagination.is_next = true;
//       }

//       if ($variables.SearchObj.in_offset === '0') {
//         $variables.pagination.is_prev = true;
//       } else {
//         $variables.pagination.is_prev = false;
//       }

//     }
//   }

//   return vbEnterListener;
// });

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
        const loadingDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        // Reorder filter chips (if you have this function)
        if ($application.functions.reorderFilterChips) {
          await $application.functions.reorderFilterChips();
        }

        // ✅ Log the search object BEFORE encryption to verify lowercase keys
        console.log("📤 SearchObj before encryption (should be lowercase):");
        console.log(JSON.stringify($variables.SearchObj, null, 2));

        if ($variables.loadEmployee) {
          $variables.loadEmployee = false;

          // Get user email
          let email = $application.constants.appType === "LOCAL_DEV" ?
            $application.constants.developerUser : $application.user.email;

          if (!email) {
            throw new Error('User email not found');
          }

          // Encrypt user email
          let encryptedUserEmail;
          try {
            encryptedUserEmail = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: {
                input: email,
              },
            });
          } catch (encryptError) {
            console.error('Error encrypting user email:', encryptError);
            throw new Error('Failed to encrypt user credentials');
          }

          // Call REST service to get employee data
          let response;
          try {
            response = await Actions.callRest(context, {
              endpoint: 'ORDS/getCommonLoginEmployee',
              headers: {
                'x-session-user-id': encryptedUserEmail,
              },
            });
          } catch (restError) {
            console.error('Error calling getCommonLoginEmployee REST service:', restError);
            throw new Error('Failed to retrieve employee information');
          }

          // Validate response structure
          if (!response || !response.body) {
            throw new Error('Invalid response from employee service');
          }

          if (!response.body.items || !Array.isArray(response.body.items)) {
            throw new Error('Invalid employee data format received');
          }

          if (response.body.items.length === 0) {
            throw new Error('No employee record found for current user');
          }

          if (response.body.items.length > 1) {
            console.warn('Multiple employee records found, using first record');
          }

          // Validate required employee data
          const employeeData = response.body.items[0];
          if (!employeeData.department_id) {
            throw new Error('Employee department information not available');
          }

          // Set department ID in search object
          $variables.department_id = employeeData.department_id;
        }
        //assigning department_id
        $variables.SearchObj.p_department_id = $variables.department_id;
        // Encrypt the payload
        let encryptJs = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: {
            plainText: $variables.SearchObj,
          },
        });

        console.log("🔐 Encrypted payload created");

        $variables.encSearchObj.payload = encryptJs;

        // Call the search endpoint
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/post_Nws_Search',
          body: $variables.encSearchObj,
        });

        console.log("📥 Response received:", response.body.OUT_STATUS);
        console.log("📊 Total records:", response.body.OUT_TOTAL_COUNT);
        console.log("📄 Records returned:", response.body.OUT_COUNT);

        // Update table data
        $variables.tableHeaderADP.data = response.body.P_OUTPUT || [];
        $variables.totalRecords = response.body.OUT_TOTAL_COUNT || 0;

        // Calculate current page
        const offset = parseInt($variables.SearchObj.in_offset, 10);
        const limit = parseInt($variables.SearchObj.in_limit, 10);
        $variables.currentPage = Math.floor(offset / limit) + 1;

        console.log("📄 Current Page:", $variables.currentPage);

        // Refresh the table
        await Actions.fireDataProviderEvent(context, {
          target: $variables.tableHeaderADP,
          refresh: null,
        });

        // Update pagination controls
        if (response.body.OUT_HAS_NEXT === 'Y') {
          $variables.pagination.is_next = false;
        } else {
          $variables.pagination.is_next = true;
        }

        if ($variables.SearchObj.in_offset === '0') {
          $variables.pagination.is_prev = true;
        } else {
          $variables.pagination.is_prev = false;
        }

        const loadingDialogClose = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });

        $variables.vShowFragment = true;

        // Show success notification
        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Search Complete',
        //   message: `Found ${$variables.totalRecords} records`,
        //   type: 'info',
        //   displayMode: 'transient'
        // });

      } catch (error) {
        console.error("❌ Error in vbAfterNavigateListener:", error);

        const loadingDialogClose2 = await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });

        await Actions.fireNotificationEvent(context, {
          summary: 'Search Error',
          message: 'Failed to load data: ' + error.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return vbAfterNavigateListener;
});