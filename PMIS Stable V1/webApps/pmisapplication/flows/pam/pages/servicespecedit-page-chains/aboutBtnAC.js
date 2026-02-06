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

  class aboutBtnAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.about.created_by = current.row.created_by;
      $variables.about.creation_date = current.row.creation_date;
      $variables.about.last_updated_by = current.row.last_updated_by;
      $variables.about.last_update_date = current.row.last_update_date;
      $variables.about.last_update_login = current.row.last_update_login;

      const aboutDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#aboutDialog',
        method: 'open',
      });

    }
  }

  return aboutBtnAC;
});