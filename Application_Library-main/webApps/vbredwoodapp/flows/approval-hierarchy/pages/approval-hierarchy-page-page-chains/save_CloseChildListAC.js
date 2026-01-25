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

  class save_CloseChildListAC extends ActionChain {

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

        const approvalHierarchyListDialogClose = await Actions.callComponentMethod(context, {
          selector: '#approvalHierarchyListDialog',
          method: 'close',
        });

        await Actions.resetVariables(context, {
          variables: [
            '$variables.approvalHierarchyListVar',
          ],
        });

        await Actions.callChain(context, {
          chain: 'loadChildTableAC',
        });
      }

    }
  }

  return save_CloseChildListAC;
});
