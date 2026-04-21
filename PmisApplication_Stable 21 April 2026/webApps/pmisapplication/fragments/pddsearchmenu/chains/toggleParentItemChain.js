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

  class toggleParentItemChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {object} params.itemData
     */
    async run(context, { event, itemData }) {
      const { $fragment, $application, $constants, $variables, $functions } = context;

      await $functions.toggleParentItem(event);
    }
  }

  return toggleParentItemChain;
});