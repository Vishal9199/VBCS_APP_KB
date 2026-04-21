define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class issueSecondaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.actionId
     * @param {any} params.event
     * @param {any} params.secondaryItem
     */
    async run(context, { actionId, event, secondaryItem }) {
      const { $variables } = context;

      if (actionId === 'about') {
        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Issue Register — Track and manage project issues including impact scores, resolution actions, and progress for this tender.',
        //   displayMode: 'persist',
        //   type: 'info',
        // });

        $variables.about.created_by = $variables.ADPissue.data[0].created_by;
        $variables.about.created_date = $variables.ADPissue.data[0].created_date;
        $variables.about.last_updated_by = $variables.ADPissue.data[0].last_updated_by;
        $variables.about.last_updated_date = $variables.ADPissue.data[0].last_updated_date;
        $variables.about.last_updated_login = $variables.ADPissue.data[0].last_updated_login;

        const aboutDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#aboutDialog',
          method: 'open',
        });

      } else if (actionId === 'saveClose') {
        await Actions.callChain(context, {
          chain: 'onSaveIssue',
        });
        // window.history.back();
      }
    }
  }

  return issueSecondaryActionChain;
});