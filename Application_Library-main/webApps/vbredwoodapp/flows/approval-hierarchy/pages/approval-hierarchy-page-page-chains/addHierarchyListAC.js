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

  class addHierarchyListAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.method === "POST") {
        let status = await Actions.callChain(context, {
          chain: 'headerAddEditAC',
        });

        if (status !== "S") {
          return;
        }
      } else {

        const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
        });

        if (dirtyDataStatus.status === "dirty" || $variables.validationGroupVars.isHeaderFormValid !== 'valid') {
          let status = await Actions.callChain(context, {
            chain: 'headerAddEditAC',
          });

          if (status !== "S") {
            return;
          }

        }

      }

      const approvalHierarchyListDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#approvalHierarchyListDialog',
        method: 'open',
      });

      const approvalHierarchyListDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#approvalHierarchyListDialog',
        method: 'setProperty',
        params: [
          'method',
          'POST',
        ],
      });

    }
  }

  return addHierarchyListAC;
});
