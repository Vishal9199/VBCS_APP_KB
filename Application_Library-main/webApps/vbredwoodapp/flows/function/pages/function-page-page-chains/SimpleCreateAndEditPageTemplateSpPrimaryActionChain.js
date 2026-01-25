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
     * @param {Object} params
     * @param {object} params.event
     * @param {boolean} params.feedbackEnabled
     */
    async run(context, { event, feedbackEnabled }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let res= await Actions.callChain(context, {
         chain: 'createEditAC',
       });

      if (res === "S") {

        await Actions.navigateBack(context, {
        });
      }
    }
  }

  return SimpleCreateAndEditPageTemplateSpPrimaryActionChain;
});
