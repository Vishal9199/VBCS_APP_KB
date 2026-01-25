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

  class save_AddAnotherChildListAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const approvalHierarchyListDialogProperty = await Actions.callComponentMethod(context, {
        selector: '#approvalHierarchyListDialog',
        method: 'getProperty',
        params: [
          'method',
        ],
      });

      let res = await Actions.callChain(context, {
        chain: 'childTableAddEditAC',
        params: {
          method: approvalHierarchyListDialogProperty,
        },
      });

      if (res === "S") {
        await Actions.resetVariables(context, {
          variables: [
            '$variables.approvalHierarchyListVar',
          ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });

        const approvalHierarchyListDialogSetProperty = await Actions.callComponentMethod(context, {
          selector: '#approvalHierarchyListDialog',
          method: 'setProperty',
          params: ['method','POST'],
        });
        
      }

    }
  }

  return save_AddAnotherChildListAC;
});
