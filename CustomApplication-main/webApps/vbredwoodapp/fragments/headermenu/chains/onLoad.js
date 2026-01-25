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

  class onLoad extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $fragment, $application, $constants, $variables, $page } = context;

      const results = await Promise.all([
        async () => {

          try {
            const response=await Actions.callChain(context, {
              chain: 'fetchMenu'
            });
            // const response = $variables.menuData;
            // console.log(response);
            const data = JSON.parse(response.body.items[0].final_json);
            // console.log("page==>:", data);
            const page = data[0]?.role[0]?.menu[0]?.function[0];
            // console.log("page==>:", page);
            // window.alert(JSON.stringify(page, null, 2));
            let objectLength = page ? Object.keys(page).length : 0;
            // window.alert("Length==>"+objectLength);
            const menuData = JSON.parse(response.body.items[0].final_json);
            // console.log("Parsed menu data:", menuData);
            // if objectLength is 0 not navigate to next page    
              // objectLength=0;
            if (objectLength === 0) {
                if ($application.currentPage.title === "Custom Application") {
                  await Actions.callChain(context, {
                  chain: 'onClickMenu',
                  });
                }
            }else{
                // 
                  const function_name = page.function_name;
                      const function_permissions = {
                        "fullAccess": null,
                        "allowCreate": null,
                        "allowDelete": null,
                        "allowEdit": null,
                        "readOnly": null
                      };
                      function_permissions.allowCreate = page.allow_create;
                      function_permissions.allowEdit = page.allow_edit;
                      function_permissions.allowDelete = page.allow_delete;
                      function_permissions.readOnly = page.read_only;
                      function_permissions.fullAccess = page.full_access;
                      let url = page.page_url;
                      if (!function_name.includes($variables.pagesWoPermission)) {
                        const appendBasicPermissionsToUrl = await $fragment.functions.appendBasicPermissionsToUrl(url, function_permissions);
                        url = appendBasicPermissionsToUrl;
                      }
                      // console.log("url", url);
                              // await Actions.openUrl(context, {
                              //   url: url,
                              // });
            }
          } catch (error) {
            // await Actions.fireNotificationEvent(context, {
            //   summary: 'You don\'t have access for this page. Please contact admin',
            // });
          } finally {
          }
        },
        async () => {
        },
      ].map(sequence => sequence()));

    }
  }

  return onLoad;
});
