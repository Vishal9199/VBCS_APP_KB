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

  class AdvancedCreateAndEditPageTemplateSpSecondaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {string} params.secondaryItem
     * @param {string} params.actionId
     */
    async run(context, { event, secondaryItem, actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      if (secondaryItem === 'refresh') {

        await Actions.resetVariables(context, {
          variables: [
            '$variables.adpAttachmentFile',
            '$variables.adpAttachmentText',
            '$variables.adpAttachmentUrl',
          ],
        });

        await Actions.callChain(context, {
          chain: 'searchAC',
        });
      }
    }
  }

  return AdvancedCreateAndEditPageTemplateSpSecondaryActionChain;
});