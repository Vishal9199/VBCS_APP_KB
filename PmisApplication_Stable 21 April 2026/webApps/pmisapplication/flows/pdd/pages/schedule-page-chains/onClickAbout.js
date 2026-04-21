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

  class onClickAbout extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

//       const aboutMessage = `
// Project Schedule Details Management
// Version: 1.0.0
// Description: Manage project schedule milestones with planned, revised, and actual dates.

// Features:
// - Inline table editing
// - Date validation
// - Change tracking
// - Bulk save operations

// Developed using Oracle Visual Builder Cloud Service (VBCS)
//       `.trim();

      $variables.about.created_by = $variables.scheduleADP.data[0].created_by;
      $variables.about.created_date = $variables.scheduleADP.data[0].created_date;
      $variables.about.last_updated_by = $variables.scheduleADP.data[0].last_updated_by;
      $variables.about.last_updated_date = $variables.scheduleADP.data[0].last_updated_date;
      $variables.about.last_updated_login = $variables.scheduleADP.data[0].last_updated_login;

      // await Actions.fireNotificationEvent(context, {
      //   summary: 'About Project Schedule Details',
      //   message: aboutMessage,
      //   type: 'info',
      //   displayMode: 'persist'
      // });

      const aboutDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#aboutDialog',
        method: 'open',
      });

      console.log("onClickAbout - About information displayed");
    }
  }

  return onClickAbout;
});