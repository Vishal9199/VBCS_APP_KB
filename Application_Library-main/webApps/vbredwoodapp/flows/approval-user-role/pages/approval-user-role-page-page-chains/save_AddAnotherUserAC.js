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

  class save_AddAnotherUserAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      const dialogProperty = await Actions.callComponentMethod(context, {
        selector: '#approvalRoleUserDialog',
        method: 'getProperty',
        params: ['method'],
      });

      let res  = await Actions.callChain(context, {
        chain: 'addEditChildTableAC',
        params: {
          method: dialogProperty,
        },
      });

      if (res === "S") {
        await Actions.resetVariables(context, {
          variables: [
            '$variables.approvalRoleUserVar',
          ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });
      }
      
    }
  }

  return save_AddAnotherUserAC;
});
