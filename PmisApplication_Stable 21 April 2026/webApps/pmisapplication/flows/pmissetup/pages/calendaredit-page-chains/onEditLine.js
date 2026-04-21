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

  class onEditLine extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.isLineMethod = 'EDIT';

      // $variables.calendarLineVar = current.row;

      let temp_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/getPmisCalendarLineGetbyid',
        headers: {
          'x-session-id': temp_key,
        },
      });

      $variables.calendarLineVar = response.body.items[0];

      $variables.lineKey = temp_key;

      const lineDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#lineDialog',
        method: 'open',
      });
    }
  }

  return onEditLine;
});
