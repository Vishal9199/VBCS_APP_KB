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
 
  class vbNotificationListener extends ActionChain {
 
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{summary:string,message:string,displayMode:string,type:string,key:string,target:string}} params.event
     * @param {messageADP} params.currentVar
     */
    async run(context, { event, currentVar }) {
      const { $page, $flow, $application, $constants, $variables } = context;
 
      await Actions.fireDataProviderEvent(context, {
        target: $variables.messageADP,
        add: {
          data: currentVar,
        },
      });
    }
  }
 
  return vbNotificationListener;
});