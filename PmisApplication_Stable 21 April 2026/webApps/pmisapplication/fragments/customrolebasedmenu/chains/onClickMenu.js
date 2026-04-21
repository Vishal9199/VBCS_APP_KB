// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
//   'ojs/ojkeyset'
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils,
//   KeySet
// ) => {
//   'use strict';

//   class onClickMenu extends ActionChain {

//     /**
//      * @param {Object} context
//      */
//     async run(context) {
//       try {
//         const { $fragment, $application, $constants, $variables, $functions } = context;

//         const fetchResponse = await Actions.callChain(context, {
//           chain: 'fetchMenu'
//         });
        
//         let response = fetchResponse || $variables.menuData || $application.variables?.menuData || context.$page?.variables?.menuData || $fragment.variables?.menuData;
        
//         // console.log("Final response", response);

//         if (!response) {
//           throw new Error("No menu data available");
//         }

//         if (response.body && response.body.count >= 1) {
//           // const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'parent');
//           // const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'role');
//           // const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'menu');
//           const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'function');
//           $variables.navigationContent = initializeNavigation;
          
//           if ($application.currentPage.title === "Custom Application") {
//             // await Actions.fireNotificationEvent(context, {
//             //   summary: $application.currentPage.title,
//             // });
//           } else {
//             const findCurrentPageInMenu = await $functions.findCurrentPageInMenu(JSON.parse(response.body.items[0].final_json), $application.currentPage.title);
//             $variables.currentPage = findCurrentPageInMenu.selectedKey;
//             $variables.expandedNodes = new KeySet.KeySetImpl(findCurrentPageInMenu.expandedKeys);
//           }

//           $variables.openPopup = true;
//         } else {
//           await this.handleNoAccess(context, response);
//         }
        
//       } catch (error) {
//         // console.error("Error in onClickMenu:", error);
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Sorry! An error occurred while loading the menu: ' + error.message,
//           displayMode: 'transient',
//           type: 'error'
//         });
//       }
//     }

//     async handleNoAccess(context, response) {
//       const { $variables, $functions, $application } = context;
      
//       await Actions.fireNotificationEvent(context, {
//         summary: 'Sorry! You don\'t have any access',
//         displayMode: 'transient',
//       });

//       if (!response?.body) return;

//       const menuData = this.extractMenuData(response);
//       if (!menuData) return;

//       const jsonString = typeof menuData === 'string' ? menuData : JSON.stringify(menuData);
      
//       try {
//         const parsedMenu = typeof menuData === 'string' ? JSON.parse(jsonString) : menuData;
//         await this.initializeNavigation(context, jsonString, parsedMenu);
//       } catch (parseError) {
//         // console.error("JSON parse error:", parseError);
//       }
//     }

//     extractMenuData(response) {
//       if (response.body.items && response.body.items.length > 0) {
//         return response.body.items[0].final_json;
//       }
//       if (response.body.count !== undefined && response.body.count >= 1 && response.body.items?.[0]) {
//         return response.body.items[0].final_json;
//       }
//       if (Array.isArray(response.body)) {
//         return response.body;
//       }
//       return response.body;
//     }

//     async initializeNavigation(context, jsonString, parsedMenu) {
//       const { $variables, $functions, $application } = context;
      
//       if (!$functions?.initializeNavigation) {
//         // console.error("initializeNavigation function not found");
//         return;
//       }

//       try {
//         const initializeNavigation = await $functions.initializeNavigation(jsonString, 'role');
        
//         if (initializeNavigation) {
//           $variables.navigationContent = initializeNavigation;
          
//           if ($application.currentPage?.title) {
//             try {
//               const findCurrentPageInMenu = await $functions.findCurrentPageInMenu(parsedMenu, $application.currentPage.title);
//               if (findCurrentPageInMenu) {
//                 $variables.currentPage = findCurrentPageInMenu.selectedKey;
//                 $variables.expandedNodes = new KeySet.KeySetImpl(findCurrentPageInMenu.expandedKeys);
//               }
//             } catch (pageError) {
//               // console.warn("Error finding current page in menu:", pageError);
//             }
//           }
          
//           $variables.openPopup = true;
//         }
//       } catch (navError) {
//         // console.error("Error in initializeNavigation:", navError);
//       }
//     }
//   }

//   return onClickMenu;
// });


define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
  'ojs/ojkeyset'
], (
  ActionChain,
  Actions,
  ActionUtils,
  KeySet
) => {
  'use strict';

  class onClickMenu extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      try {
        const { $fragment, $application, $constants, $variables, $functions } = context;

        const fetchResponse = await Actions.callChain(context, {
          chain: 'fetchMenu'
        });
        
        let response = fetchResponse || $variables.menuData || $application.variables?.menuData || context.$page?.variables?.menuData || $fragment.variables?.menuData;
        
        // console.log("Final response", response);

        if (!response) {
          throw new Error("No menu data available");
        }

        if (response.body && response.body.count >= 1) {
          // const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'parent');
          const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'role');
          // const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'menu');
          // const initializeNavigation = await $functions.initializeNavigation(JSON.parse(response.body.items[0].final_json), 'function');
          $variables.navigationContent = initializeNavigation;
          
          if ($application.currentPage.title === "Custom Application") {
            // await Actions.fireNotificationEvent(context, {
            //   summary: $application.currentPage.title,
            // });
          } else {
            const findCurrentPageInMenu = await $functions.findCurrentPageInMenu(JSON.parse(response.body.items[0].final_json), $application.currentPage.title);
            $variables.currentPage = findCurrentPageInMenu.selectedKey;
            $variables.expandedNodes = new KeySet.KeySetImpl(findCurrentPageInMenu.expandedKeys);
          }

          $variables.openPopup = true;
        } else {
          await this.handleNoAccess(context, response);
        }
        
      } catch (error) {
        // console.error("Error in onClickMenu:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Sorry! An error occurred while loading the menu: ' + error.message,
          displayMode: 'transient',
          type: 'error'
        });
      }
    }

    async handleNoAccess(context, response) {
      const { $variables, $functions, $application } = context;
      
      await Actions.fireNotificationEvent(context, {
        summary: 'Sorry! You don\'t have any access',
        displayMode: 'transient',
      });

      if (!response?.body) return;

      const menuData = this.extractMenuData(response);
      if (!menuData) return;

      const jsonString = typeof menuData === 'string' ? menuData : JSON.stringify(menuData);
      
      try {
        const parsedMenu = typeof menuData === 'string' ? JSON.parse(jsonString) : menuData;
        await this.initializeNavigation(context, jsonString, parsedMenu);
      } catch (parseError) {
        // console.error("JSON parse error:", parseError);
      }
    }

    extractMenuData(response) {
      if (response.body.items && response.body.items.length > 0) {
        return response.body.items[0].final_json;
      }
      if (response.body.count !== undefined && response.body.count >= 1 && response.body.items?.[0]) {
        return response.body.items[0].final_json;
      }
      if (Array.isArray(response.body)) {
        return response.body;
      }
      return response.body;
    }

    async initializeNavigation(context, jsonString, parsedMenu) {
      const { $variables, $functions, $application } = context;
      
      if (!$functions?.initializeNavigation) {
        // console.error("initializeNavigation function not found");
        return;
      }

      try {
        const initializeNavigation = await $functions.initializeNavigation(jsonString, 'menu');
        
        if (initializeNavigation) {
          $variables.navigationContent = initializeNavigation;
          
          if ($application.currentPage?.title) {
            try {
              const findCurrentPageInMenu = await $functions.findCurrentPageInMenu(parsedMenu, $application.currentPage.title);
              if (findCurrentPageInMenu) {
                $variables.currentPage = findCurrentPageInMenu.selectedKey;
                $variables.expandedNodes = new KeySet.KeySetImpl(findCurrentPageInMenu.expandedKeys);
              }
            } catch (pageError) {
              // console.warn("Error finding current page in menu:", pageError);
            }
          }
          
          $variables.openPopup = true;
        }
      } catch (navError) {
        // console.error("Error in initializeNavigation:", navError);
      }
    }
  }

  return onClickMenu;
});