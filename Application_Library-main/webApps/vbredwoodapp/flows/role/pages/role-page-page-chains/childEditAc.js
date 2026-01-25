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

  class childEditAc extends ActionChain {

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

      $variables.childUser = current.row;
      console.log(current.row);

      const userDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#userDialog',
        method: 'setProperty',
        params: ['method','PUT'],
      });
      
      const dirtyDataStatus = await Actions.getDirtyDataStatus(context, {
      });


      $variables.user_field_hide = 'edit';
        if (dirtyDataStatus.status === "dirty" || $variables.validform.isHeaderFormValid !== 'valid') {

        status = await Actions.callChain(context, {
          chain: 'headerEditSaveAC',
        });

        if (status === 'S') {
          const userDialogOpen = await Actions.callComponentMethod(context, {
            selector: '#userDialog',
            method: 'open',
          });
        }
      }
      else{
      const userDialogOpen2 = await Actions.callComponentMethod(context, {
        selector: '#userDialog',
        method: 'open',
      });}

   
    }
  }

  return childEditAc;
});
