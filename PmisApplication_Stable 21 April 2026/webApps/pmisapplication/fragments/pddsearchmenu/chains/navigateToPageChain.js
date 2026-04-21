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

  class navigateToPageChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {object} params.itemData
     */
    async run(context, { event, itemData }) {
      const { $fragment, $application, $constants, $variables } = context;

      // Prevent default link behavior - Fixed for VBCS event handling
      try {
        if (event) {
          // Get the original DOM event from VBCS event wrapper
          const originalEvent = event.detail && event.detail.originalEvent 
            ? event.detail.originalEvent 
            : event;
          
          if (originalEvent && typeof originalEvent.preventDefault === 'function') {
            originalEvent.preventDefault();
          }
        }
      } catch (error) {
        console.warn('Could not prevent default event:', error);
      }

      try {
        // Get navigation path from data attributes
        // Use event.target or event.currentTarget safely
        let targetElement = null;
        
        if (event) {
          if (event.detail && event.detail.originalEvent) {
            targetElement = event.detail.originalEvent.currentTarget || event.detail.originalEvent.target;
          } else if (event.currentTarget) {
            targetElement = event.currentTarget;
          } else if (event.target) {
            targetElement = event.target;
          }
        }

        if (!targetElement) {
          console.error('No target element found in event');
          return;
        }

        // Get navigation data from element attributes
        const itemPath = targetElement.getAttribute('data-path');
        const itemId = targetElement.getAttribute('data-item-id');
        const itemName = targetElement.getAttribute('data-item-name');

        console.log('Navigation triggered:', {
          path: itemPath,
          id: itemId,
          name: itemName
        });

        if (!itemPath) {
          console.warn('No navigation path found for item:', itemId);
          
          await Actions.fireNotificationEvent(context, {
            summary: 'Navigation Error',
            message: 'No page path configured for this menu item',
            displayMode: 'transient',
            type: 'warning',
          });
          
          return;
        }

        // Update selected navigation item
        $variables.selectedNavItem = itemId;

        // Close the drawer
        $variables.drawerOpened = false;

        // Navigate to the page within the SAME FLOW
        // Using navigateToPage since we're in a fragment within the pdd flow
        const navigateToPage = await Actions.navigateToPage(context, {
          page: itemPath,
          history: 'push',
        });

        // Fire success notification (optional)
        await Actions.fireNotificationEvent(context, {
          summary: 'Navigation',
          message: `Navigated to ${itemName}`,
          displayMode: 'transient',
          type: 'confirmation',
        });

      } catch (error) {
        console.error('Navigation error:', error);
        
        // Fire error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Navigation Error',
          message: `Failed to navigate: ${error.message}`,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return navigateToPageChain;
});