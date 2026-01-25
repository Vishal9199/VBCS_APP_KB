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

  class addChildAC extends ActionChain {

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

        $variables.parameterVar.program_code = $variables.programVar.program_code;
        $variables.parameterVar.program_name = $variables.programVar.program_name;
        $variables.parameterVar.program_type = $variables.programVar.program_type;

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

      const parameterConfigDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#parameterConfigDialog',
        method: 'open',
      });

      const parameterConfigDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#parameterConfigDialog',
        method: 'setProperty',
        params: [
          'method',
          'POST',
        ],
      });

    }
  }

  return addChildAC;
});
