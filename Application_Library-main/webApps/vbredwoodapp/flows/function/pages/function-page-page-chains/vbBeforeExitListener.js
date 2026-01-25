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

  class vbBeforeExitListener extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{origin:string,direction:string,steps:number,canBeCanceled:boolean,dirtyDataStatus:string}} params.event
     * @return {{cancelled:boolean}}
     */
    async run(context, { event }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if(event.dirtyDataStatus === 'dirty'){

        const unsavedChangesDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#unsavedChangesDialog',
          method: 'open',
        });
        
      }

      
      // Navigation from this page can be canceled by returning an object with the property cancelled set to true. This is useful when the page state is dirty and navigation should not be allowed before saving.
      return { cancelled: event.dirtyDataStatus === 'dirty' };
    }
  }

  return vbBeforeExitListener;
});
 