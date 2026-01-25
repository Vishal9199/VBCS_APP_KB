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

  class createAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let temp_key = '0';
      let temp_method;

      temp_key = await Actions.callChain(context, {
        chain: 'application:encryptLargePayloadWithTime',
        params: {
          plainText: temp_key,
        },
      });

      temp_method = await Actions.callChain(context, {
        chain: 'application:encryptLargePayloadWithTime',
        params: {
          plainText: 'POST',
        },
      });

      $variables.currentRow_Key = temp_key;
      $variables.passMethod = temp_method;

      await Actions.callChain(context, {
        chain: 'ok_createBtn_AC',
      });

      // const tenderDialogOpen = await Actions.callComponentMethod(context, {
      //   selector: '#tenderDialog',
      //   method: 'open',
      // });
    }
  }

  return createAC;
});
