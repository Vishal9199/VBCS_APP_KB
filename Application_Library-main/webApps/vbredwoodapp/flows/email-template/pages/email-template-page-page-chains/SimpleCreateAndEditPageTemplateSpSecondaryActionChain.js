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

  class SimpleCreateAndEditPageTemplateSpSecondaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId 
     */
    async run(context, { actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;



      switch (actionId) {
        case 'save': {
          

          const res = await Actions.callChain(context, {
            chain: 'lookupTypeAddEditAc',
          });

          if(res !== 'S'){

            await Actions.fireNotificationEvent(context, {
              summary: res,
            });
            
            return;
          } else{
            await Actions.callChain(context, {
            chain: 'loadHeaderAC',
          });
          }

          
          break;
        }
        default:
          break;
      }

    }
  }

  return SimpleCreateAndEditPageTemplateSpSecondaryActionChain;
});
