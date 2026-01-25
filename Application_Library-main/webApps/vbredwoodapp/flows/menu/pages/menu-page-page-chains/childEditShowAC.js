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

  class childEditShowAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.subMenuVar = current.row;



      const fidMenuEntriesDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#fid_menuEntriesDialog',
        method: 'setProperty',
        params: ['method','PUT'],
      });

      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });

      $variables.function_field_hide = 'edit';

      if (dirtyDataStatus.status === "dirty" || $variables.validform.isHeaderFormValid !== 'valid') {

        status = await Actions.callChain(context, {
          chain: 'headerEditSaveAC',
        });

        if (status === 'S') {
          const fidMenuEntriesDialogOpen2 = await Actions.callComponentMethod(context, {
            selector: '#fid_menuEntriesDialog',
            method: 'open',
          });
        }
      }
     else{
      const fidMenuEntriesDialogOpen = await Actions.callComponentMethod(context, {
        selector: '#fid_menuEntriesDialog',
        method: 'open',
      });}
     
    }
  }

  return childEditShowAC;
});
