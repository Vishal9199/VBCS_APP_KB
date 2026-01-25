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

  class saveandaddChildBtnAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const paramChildDialogProperty = await Actions.callComponentMethod(context, {
        selector: '#ParamChildDialog',
        method: 'getProperty',
        params: [
  'method',
],
      });

      const res = await Actions.callChain(context, {
        chain: 'syncParamChildAddEditAC',
        params: {
          method: paramChildDialogProperty,
        },
      });

      if (res === "S") {

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
          params: {
            'lv_header_id': $variables.ScheduleSyncSearchVar.schedule_id,
          },
        });

        $variables.ScheduleSyncParamSearchVar.sequence_no = await $functions.getDisplayNum($variables.paramADP.data);

        await Actions.resetVariables(context, {
          variables: [
    '$variables.ScheduleSyncParamSearchVar.next_schedule_time_temp',
    '$variables.ScheduleSyncParamSearchVar.param_name',
    '$variables.ScheduleSyncParamSearchVar.param_value',
    '$variables.ScheduleSyncParamSearchVar.last_update_date',
    '$variables.ScheduleSyncParamSearchVar.last_updated_by',
    '$variables.ScheduleSyncParamSearchVar.sequence_no',
    '$variables.ScheduleSyncParamSearchVar.created_by',
    '$variables.ScheduleSyncParamSearchVar.creation_date',
    '$variables.ScheduleSyncParamSearchVar.next_schedule_time',
    '$variables.ScheduleSyncParamSearchVar.param_id',
  ],
        });

      }
    }
  }

  return saveandaddChildBtnAC;
});
