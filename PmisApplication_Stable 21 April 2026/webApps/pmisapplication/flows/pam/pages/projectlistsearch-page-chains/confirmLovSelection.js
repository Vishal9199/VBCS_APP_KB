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

  class confirmLovSelection extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let enc_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: '0',
        },
      });

      const toProjectlistedit = await Actions.navigateToPage(context, {
        page: 'projectlistedit',
        params: {
          pNavCode: 'CREATE',
          pNavId: enc_key,
          enterType: 'PROJECT_CREATE',
          inputProjectDtls: $variables.passProjectDtlsVar,
        },
      });
    }
  }

  return confirmLovSelection;
});