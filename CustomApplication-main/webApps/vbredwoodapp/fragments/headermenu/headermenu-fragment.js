define([
  "knockout",
  "ojs/ojknockout-keyset",
  "ojs/ojarraytreedataprovider",
], function (ko, keySet, ArrayTreeDataProvider) {
  "use strict";

  class FragmentModule {
    constructor() {
      this.navigationContent = undefined;
    }

    /**
     * Initialize navigation based on sub array type
     * @param {Array} payload - The navigation data payload
     * @param {string} subArrayName - 'parent', 'role', 'menu', or 'function'
     * @returns {ko.observable} Observable ArrayTreeDataProvider
     */
    initializeNavigation(payload, subArrayName = 'parent') {
      try {
        if (!payload || !Array.isArray(payload) || payload.length === 0) {
          return ko.observable(new ArrayTreeDataProvider([], { keyAttributes: "attr.id" }));
        }

        // Fix missing function properties first
        this.fixFunctionProperties(payload);

        let transformedMenu = [];

        switch (subArrayName.toLowerCase()) {
          case 'parent':
            transformedMenu = this.buildParentStructure(payload);
            break;
          case 'role':
            transformedMenu = this.buildRoleStructure(payload);
            break;
          case 'menu':
            transformedMenu = this.buildMenuStructure(payload);
            break;
          case 'function':
            transformedMenu = this.buildFunctionStructure(payload);
            break;
          default:
            transformedMenu = this.buildParentStructure(payload);
        }

        return ko.observable(
          new ArrayTreeDataProvider(
            this.convertToTreeData(transformedMenu),
            { keyAttributes: "attr.id" }
          )
        );
      } catch (error) {
        console.error("Error initializing navigation:", error);
        return ko.observable(new ArrayTreeDataProvider([], { keyAttributes: "attr.id" }));
      }
    }

    /**
     * Fix missing function properties in payload
     */
    fixFunctionProperties(payload) {
      payload.forEach(app => {
        if (app.role && Array.isArray(app.role)) {
          app.role.forEach(role => {
            if (role.menu && Array.isArray(role.menu)) {
              role.menu.forEach(menu => {
                if (!menu['function']) {
                  menu['function'] = [];
                }
                if (!Array.isArray(menu['function'])) {
                  menu['function'] = [];
                }
              });
            }
          });
        }
      });
    }

    /**
     * Build App → Role → Menu → Function structure
     */
    buildParentStructure(payload) {
      let result = [];

      payload.forEach(app => {
        let appNode = {
          id: `app_${app.application_id}`,
          label: app.application_name,
          icon: "oj-ux-ico-folder",
          node: "application",
          items: []
        };

        if (app.role && Array.isArray(app.role)) {
          app.role.forEach(role => {
            let roleNode = {
              id: `role_${role.role_id}`,
              label: role.role_name,
              icon: "oj-ux-ico-group",
              node: "role",
              items: []
            };

            if (role.menu && Array.isArray(role.menu)) {
              role.menu.forEach(menu => {
                let menuNode = {
                  id: `menu_${menu.menu_id}`,
                  label: menu.menu_name,
                  icon: "oj-ux-ico-folder-open",
                  node: "menu",
                  items: []
                };

                if (menu['function'] && Array.isArray(menu['function'])) {
                  menu['function'].forEach(func => {
                    if (func.menu_active_flag === "Y") {
                      menuNode.items.push(this.createFunctionNode(func));
                    }
                  });
                }

                if (menuNode.items.length > 0) {
                  roleNode.items.push(menuNode);
                }
              });
            }

            if (roleNode.items.length > 0) {
              appNode.items.push(roleNode);
            }
          });
        }

        if (appNode.items.length > 0) {
          result.push(appNode);
        }
      });

      return result;
    }

    /**
     * Build Role → Menu → Function structure
     */
    buildRoleStructure(payload) {
      let result = [];

      payload.forEach(app => {
        if (app.role && Array.isArray(app.role)) {
          app.role.forEach(role => {
            let roleNode = {
              id: `role_${role.role_id}`,
              label: role.role_name,
              icon: "oj-ux-ico-group",
              node: "role",
              items: []
            };

            if (role.menu && Array.isArray(role.menu)) {
              role.menu.forEach(menu => {
                let menuNode = {
                  id: `menu_${menu.menu_id}`,
                  label: menu.menu_name,
                  icon: "oj-ux-ico-folder-open",
                  node: "menu",
                  items: []
                };

                if (menu['function'] && Array.isArray(menu['function'])) {
                  menu['function'].forEach(func => {
                    if (func.menu_active_flag === "Y") {
                      menuNode.items.push(this.createFunctionNode(func));
                    }
                  });
                }

                if (menuNode.items.length > 0) {
                  roleNode.items.push(menuNode);
                }
              });
            }

            if (roleNode.items.length > 0) {
              result.push(roleNode);
            }
          });
        }
      });

      return result;
    }

    /**
     * Build Menu → Function structure (flattened)
     */
    buildMenuStructure(payload) {
      let result = [];
      let processedMenus = new Set();

      payload.forEach(app => {
        if (app.role && Array.isArray(app.role)) {
          app.role.forEach(role => {
            if (role.menu && Array.isArray(role.menu)) {
              role.menu.forEach(menu => {
                let menuKey = `${menu.menu_id}_${menu.menu_code}`;
                if (!processedMenus.has(menuKey)) {
                  processedMenus.add(menuKey);

                  let menuNode = {
                    id: `menu_${menu.menu_id}`,
                    label: menu.menu_name,
                    icon: "oj-ux-ico-folder-open",
                    node: "menu",
                    items: []
                  };

                  if (menu['function'] && Array.isArray(menu['function'])) {
                    menu['function'].forEach(func => {
                      if (func.menu_active_flag === "Y") {
                        menuNode.items.push(this.createFunctionNode(func));
                      }
                    });
                  }

                  if (menuNode.items.length > 0) {
                    result.push(menuNode);
                  }
                }
              });
            }
          });
        }
      });

      return result;
    }

    /**
     * Build Function structure (flat list)
     */
    buildFunctionStructure(payload) {
      let result = [];
      let processedFunctions = new Set();

      payload.forEach(app => {
        if (app.role && Array.isArray(app.role)) {
          app.role.forEach(role => {
            if (role.menu && Array.isArray(role.menu)) {
              role.menu.forEach(menu => {
                if (menu['function'] && Array.isArray(menu['function'])) {
                  menu['function'].forEach(func => {
                    if (func.menu_active_flag === "Y") {
                      let funcKey = `${func.menu_entry_id}_${func.function_code}`;
                      if (!processedFunctions.has(funcKey)) {
                        processedFunctions.add(funcKey);
                        result.push(this.createFunctionNode(func));
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });

      return result;
    }

    /**
     * Create function node
     */
    createFunctionNode(func) {
      return {
        id: `func_${func.menu_entry_id}`,
        label: func.function_name,
        icon: this.getFunctionIcon(func.function_code),
        node: "function",
        url: func.page_url || func.Page_Url,
        permissions: {
          fullAccess: func.full_access === "Y",
          allowEdit: func.allow_edit === "Y",
          allowCreate: func.allow_create === "Y",
          allowDelete: func.allow_delete === "Y",
          readOnly: func.read_only === "Y"
        }
      };
    }

    /**
     * Get function icon based on function code
     */
    getFunctionIcon(functionCode) {
      if (!functionCode) return "oj-ux-ico-document";

      const code = functionCode.toLowerCase();
      if (code.includes('upload')) return "oj-ux-ico-upload";
      if (code.includes('transfer')) return "oj-ux-ico-transfer";
      if (code.includes('matrix')) return "oj-ux-ico-grid";
      if (code.includes('admin')) return "oj-ux-ico-settings";
      return "oj-ux-ico-document";
    }

    /**
     * Convert to ArrayTreeDataProvider format
     */
    convertToTreeData(menu) {
      let navData = [];

      menu.forEach(item => {
        let menuItem = {
          attr: {
            id: item.id,
            name: item.label,
            icon: item.icon,
            node: item.node,
            url: item.url,
            permissions: item.permissions
          }
        };

        if (item.items && item.items.length > 0) {
          menuItem.children = this.convertToTreeData(item.items);
        }

        navData.push(menuItem);
      });

      return navData;
    }

    /**
     * Handle navigation selection
     */
    handleNavSelection(event) {
      const selection = event.detail.value;
      if (selection && selection.size > 0) {
        const selectedKey = selection.values().next().value;
        const selectedItem = this.findItemById(selectedKey);

        if (selectedItem && selectedItem.attr.url && selectedItem.attr.node === 'function') {
          window.open(selectedItem.attr.url, '_blank');
        }
      }
    }

    /**
     * Find item by ID
     */
    findItemById(id, items = null) {
      if (!items) {
        items = this.navigationContent().data;
      }

      for (let item of items) {
        if (item.attr.id === id) {
          return item;
        }
        if (item.children) {
          const found = this.findItemById(id, item.children);
          if (found) return found;
        }
      }
      return null;
    }
    appendBasicPermissionsToUrl(baseUrl, permissions) {
      if (!baseUrl || !permissions) return baseUrl;

      try {
        const separator = baseUrl.indexOf('?') === -1 ? '?' : '&';
        const permissionString = `readOnly=${permissions.readOnly}&allowEdit=${permissions.allowEdit}&allowDelete=${permissions.allowDelete}&fullAccess=${permissions.fullAccess}&allowCreate=${permissions.allowCreate}`;

        return baseUrl + separator + permissionString;
      } catch {
        return baseUrl;
      }
    }

    findCurrentPageInMenu(menuData, currentPageTitle) {
      const expandedKeys = [];
      let selectedKey = null;
      
      try {
        console.log('Searching for page title:', currentPageTitle);
        
        for (const application of menuData) {
          for (const role of application.role) {
            const roleKey = `role_${role.role_id}`;
            
            for (const menu of role.menu || []) {
              const menuKey = `menu_${menu.menu_id}`;
              
              for (const func of menu.function || []) {
                const funcKey = `func_${func.menu_entry_id}`;

                
                // Match based on function_name with current page title
                if (this.matchPageTitle(func.function_name, currentPageTitle)) {
                  // Found current page - build expansion path
                  expandedKeys.push(roleKey, menuKey);
                  selectedKey = funcKey;
                  
                  console.log(`✅ Found current page match:`);
                  console.log(`   Function: ${func.function_name}`);
                  console.log(`   Role: ${role.role_name}`);
                  console.log(`   Menu: ${menu.menu_name}`);
                  console.log(`   Keys: ${roleKey} -> ${menuKey} -> ${funcKey}`);
                  
                  return { expandedKeys, selectedKey };
                }
              }
            }
          }
        }
        
        console.warn('Current page not found in menu structure');
        console.log('Searched for title:', currentPageTitle);
        
      } catch (error) {
        console.error('Error finding current page in menu:', error);
      }
      
      return { expandedKeys, selectedKey };
    }

    expandNodes(menuData) {
      const expandedKeys = [];
        for (const application of menuData) {
          for (const role of application.role) {
            const roleKey = `role_${role.role_id}`;
            
            for (const menu of role.menu || []) {
              const menuKey = `menu_${menu.menu_id}`;
              
              for (const func of menu.function || []) {
                const funcKey = `func_${func.menu_entry_id}`;
                  // Found current page - build expansion path
                  expandedKeys.push(roleKey, menuKey);                 
                 
                }
              }
            }
          }
          document.getElementById("expandCollapseLink").value="Show Less";
      return expandedKeys;
    }

    matchPageTitle(functionName, currentPageTitle) {
      if (!functionName || !currentPageTitle) {
        return false;
      }
      
      // Convert both to lowercase for comparison
      const funcNameLower = functionName.toLowerCase().trim();
      const pageTitleLower = currentPageTitle.toLowerCase().trim();
      
      // Strategy 1: Exact match
      if (funcNameLower === pageTitleLower) {
        console.log(`Exact match: "${functionName}" === "${currentPageTitle}"`);
        return true;
      }
      
      // Strategy 2: Current page title contains function name
      if (pageTitleLower.includes(funcNameLower)) {
        console.log(`Page title contains function name: "${currentPageTitle}" contains "${functionName}"`);
        return true;
      }
      
      // Strategy 3: Function name contains current page title
      if (funcNameLower.includes(pageTitleLower)) {
        console.log(`Function name contains page title: "${functionName}" contains "${currentPageTitle}"`);
        return true;
      }
      
      // Strategy 4: Remove common words and compare
      const cleanFuncName = funcNameLower.replace(/\b(page|form|add|edit|create|update|manage|request)\b/g, '').trim();
      const cleanPageTitle = pageTitleLower.replace(/\b(page|form|add|edit|create|update|manage|request)\b/g, '').trim();
      
      if (cleanFuncName && cleanPageTitle && cleanFuncName === cleanPageTitle) {
        console.log(`Clean match: "${cleanFuncName}" === "${cleanPageTitle}"`);
        return true;
      }
      
      // Strategy 5: Word-by-word comparison (at least 2 words match)
      const funcWords = funcNameLower.split(/\s+/);
      const pageWords = pageTitleLower.split(/\s+/);
      const matchingWords = funcWords.filter(word => 
        word.length > 2 && pageWords.some(pageWord => pageWord.includes(word) || word.includes(pageWord))
      );
      
      if (matchingWords.length >= 2) {
        console.log(`Word match: ${matchingWords.length} words matched between "${functionName}" and "${currentPageTitle}"`);
        return true;
      }
      
      return false;
    }
  


    /**
     *
     * @param {string} arg1
     * @return {string}
     */
    tesst(arg1) {
    }
  }

  return FragmentModule;
});