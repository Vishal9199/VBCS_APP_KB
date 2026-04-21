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

  class navigationMenuClickAction extends ActionChain {

    async run(context, { menuId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("Menu item clicked:", menuId);

        // Update selected menu item
        $variables.MenuSelection = menuId;

        // Close drawer after navigation (optional)
        $variables.drawerOpen = false;

        // Add your navigation logic here based on menuId
        // Example navigation logic:
        switch(menuId) {
          case 'pddgeneral':
            // Navigate to General page
            console.log("Navigate to General");
            break;
          case 'pddattribute':
            // Navigate to Attributes page
            console.log("Navigate to Attributes");
            break;
          case 'pddcontract-contract':
            // Navigate to Contract page
            console.log("Navigate to Contract");
            break;
          case 'pddcontract-contact':
            // Navigate to Contact page
            console.log("Navigate to Contact");
            break;
          case 'pddschedule':
            // Navigate to Schedule page
            console.log("Navigate to Schedule");
            break;
          case 'pddstatusupdate-progress':
            // Navigate to Progress page
            console.log("Navigate to Progress");
            break;
          case 'pddstatusupdate-hse':
            // Navigate to HSE page
            console.log("Navigate to HSE");
            break;
          case 'pddstatusupdate-quality':
            // Navigate to Quality Control page
            console.log("Navigate to Quality Control");
            break;
          // Add more cases as needed
          default:
            console.log("Menu item:", menuId);
        }

      } catch (error) {
        console.error("Navigation error:", error);
      }
    }
  }

  return navigationMenuClickAction;
});