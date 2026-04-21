// /* Copyright (c) 2025, Oracle and/or its affiliates */

// define([], () => {
//   'use strict';
  
//   class PageModule {
//   }
    
//   return PageModule;
// });
  
define([], () => {
  'use strict';

  class NavigationConfig {
    
    /**
     * Get navigation configuration for menu item
     * @param {string} menuItemId - The menu item ID
     * @returns {Object} Navigation configuration
     */
    getNavigationConfig(menuItemId) {
      const navigationMap = {
        'pddgeneral': {
          page: 'general',
          flow: 'main',
          title: 'General',
          requiresAuth: false
        },
        'pddattribute': {
          page: 'attributes',
          flow: 'main',
          title: 'Attributes',
          requiresAuth: false
        },
        'pddcontract-contract': {
          page: 'contract',
          flow: 'main',
          title: 'Contract',
          requiresAuth: true,
          params: { mode: 'view' }
        },
        'pddcontract-contact': {
          page: 'contact',
          flow: 'main',
          title: 'Contact',
          requiresAuth: true,
          params: { mode: 'view' }
        },
        'pddschedule': {
          page: 'schedule',
          flow: 'main',
          title: 'Schedule',
          requiresAuth: true
        },
        'pddstatusupdate-progress': {
          page: 'progress',
          flow: 'main',
          title: 'Progress',
          requiresAuth: true,
          params: { statusType: 'progress' }
        },
        'pddstatusupdate-hse': {
          page: 'hse',
          flow: 'main',
          title: 'HSE',
          requiresAuth: true,
          params: { statusType: 'hse' }
        },
        'pddstatusupdate-quality': {
          page: 'quality-control',
          flow: 'main',
          title: 'Quality Control',
          requiresAuth: true,
          params: { statusType: 'quality' }
        },
        'pddpayment': {
          page: 'payment-certification',
          flow: 'main',
          title: 'Payment Certification',
          requiresAuth: true
        },
        'pddbudget': {
          page: 'budget-control',
          flow: 'main',
          title: 'Budget Control',
          requiresAuth: true
        },
        'pddstakeholder': {
          page: 'stakeholder-analysis',
          flow: 'main',
          title: 'Stakeholder Analysis',
          requiresAuth: true
        },
        'pddchangeorder': {
          page: 'change-order',
          flow: 'main',
          title: 'Change Order',
          requiresAuth: true
        },
        'pddchangevariation': {
          page: 'change-variation-register',
          flow: 'main',
          title: 'Change/Variation Control Register',
          requiresAuth: true
        },
        'pddrisk': {
          page: 'risk-management',
          flow: 'main',
          title: 'Risk Management',
          requiresAuth: true
        },
        'pddissue': {
          page: 'issue-register',
          flow: 'main',
          title: 'Issue Register',
          requiresAuth: true
        },
        'pddlesson': {
          page: 'lesson-learned',
          flow: 'main',
          title: 'Lesson Learned',
          requiresAuth: true
        },
        'pddweekly': {
          page: 'weekly-highlights',
          flow: 'main',
          title: 'Weekly Highlights',
          requiresAuth: true
        },
        'pdddocuments': {
          page: 'project-documents',
          flow: 'main',
          title: 'Project Documents',
          requiresAuth: true
        },
        'pddqliksense': {
          page: 'qliksense-dashboard',
          flow: 'main',
          title: 'QlikSense Dashboard',
          requiresAuth: true,
          isExternal: false
        }
      };

      return navigationMap[menuItemId] || null;
    }

    /**
     * Get all navigation items
     * @returns {Array} All navigation configurations
     */
    getAllNavigationItems() {
      return Object.keys(this.navigationMap).map(key => ({
        id: key,
        ...this.navigationMap[key]
      }));
    }

  }

  return NavigationConfig;
});