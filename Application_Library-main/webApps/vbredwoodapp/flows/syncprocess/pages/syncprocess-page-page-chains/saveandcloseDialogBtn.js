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

  class saveandcloseDialogBtn extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

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

        const paramChildDialogClose = await Actions.callComponentMethod(context, {
          selector: '#ParamChildDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
    '$variables.ScheduleSyncParamSearchVar',
  ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
          params: {
            'lv_header_id': $variables.key,
          },
        });

      }
    }
  }

  return saveandcloseDialogBtn;
});
