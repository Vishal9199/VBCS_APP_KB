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

  class DialogCloseChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
    '$variables.ScheduleSyncParamSearchVar',
  ],
      });

      const dialogScheduleIDReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-Schedule-ID',
        method: 'reset',
      });

      const dialogParamNameReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-Param-Name',
        method: 'reset',
      });

      const dialogParamValueReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-Param-Value',
        method: 'reset',
      });

      const dialogDateTimeReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-date-time',
        method: 'reset',
      });

      const dialogSequenceNoReset = await Actions.callComponentMethod(context, {
        selector: '#dialog-sequence-no',
        method: 'reset',
      });

      
    }
  }

  return DialogCloseChain;
});
