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



      if (actionId === "save") {

        await Actions.callChain(context, {
          chain: 'lookupTypeAddEditAc',
        });

      }

    }
  }

  return SimpleCreateAndEditPageTemplateSpSecondaryActionChain;
});
