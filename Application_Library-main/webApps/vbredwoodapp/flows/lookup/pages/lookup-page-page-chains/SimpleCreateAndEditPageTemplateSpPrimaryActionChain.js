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

  class SimpleCreateAndEditPageTemplateSpPrimaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let res = await Actions.callChain(context, {
        chain: 'lookupTypeAddEditAc',
      });

      if (res === "S") {

        await Actions.navigateBack(context, {
        });

      }
      
    }
  }

  return SimpleCreateAndEditPageTemplateSpPrimaryActionChain;
});
