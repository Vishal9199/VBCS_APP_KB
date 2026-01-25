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

  class onSelectMenu extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.id 
     */
    async run(context, { id }) {
      const { $fragment, $application, $constants, $variables } = context;

      console.log("data", id);
      if (id.attr.node === "menu") {
        // console.log("menu_id",id.attr.menu_id);
        // console.log("menu_code",id.attr.menu_code);
        // console.log("menu_id: ", id.attr.id);
        // console.log("menu_name: ", id.attr.name);
      }
      if (id.attr.node === "role") {
        // console.log("role_id: ", id.attr.id);
        // console.log("role_name: ", id.attr.name);
      }
      if (id.attr.node === "function") {

        // console.log("func_id: ", id.attr.id);
        // console.log("full_access: ", id.attr.permissions.fullAccess);
        // console.log("allow_edit: ", id.attr.permissions.allowEdit);
        // console.log("allow_create: ", id.attr.permissions.allowCreate);
        // console.log("allow_delete: ", id.attr.permissions.allowDelete);
        // console.log("read_only: ", id.attr.permissions.readOnly);
        const function_name = id.attr.name;

        const function_permissions = {
          "fullAccess": null,
          "allowCreate": null,
          "allowDelete": null,
          "allowEdit": null,
          "readOnly": null
        };
        function_permissions.allowCreate = id.attr.permissions.allowCreate;
        function_permissions.allowEdit = id.attr.permissions.allowEdit;
        function_permissions.allowDelete = id.attr.permissions.allowDelete;
        function_permissions.readOnly = id.attr.permissions.readOnly;
        function_permissions.fullAccess = id.attr.permissions.fullAccess;

        let url = id.attr.url;

        if (!function_name.includes($variables.pagesWoPermission)) {
          const appendBasicPermissionsToUrl = await $fragment.functions.appendBasicPermissionsToUrl(url, function_permissions);

          url = appendBasicPermissionsToUrl;

        }

        await Actions.openUrl(context, {
          url: url,
          history: 'push',
        });
      }
    }
  }

  return onSelectMenu;
});