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

  class saveClobFieldAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.content
     */
    async run(context, { content }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let loginUser = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $application.user.email,
        },
      });

      let objVersion = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postPayloadTypeVar.object_version_num,
        },
      });

      let hdr_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postPayloadTypeVar.strategy_hdr_id,
        },
      });

      let typeCode = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'TENDERSTRATEGY',
        },
      });
      let sanitizedContent = content || '';
      const response = await Actions.callRest(context, {
        endpoint: 'ORDS/postTenderStrategyUpdate',
        headers: {
          'x-session-id': hdr_id,
          'x-login-user': loginUser,
          'x-obj-version': objVersion,
          'x-type-code': typeCode,
        },
        body: sanitizedContent,
      });

      
    }
  }

  return saveClobFieldAC;
});
