define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
  'ojs/ojkeyset'
], (
  ActionChain,
  Actions,
  ActionUtils,
  KeySet
) => {
  'use strict';

  class showMoreAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $fragment, $application, $constants, $variables, $functions } = context;

      if ( $variables.isShowMore) {



        const response = await Actions.callChain(context, {
          chain: 'fetchMenu',
        });

        const expandNodes = await $functions.expandNodes(JSON.parse(response.body.items[0].final_json));

        $variables.expandedNodes = new KeySet.KeySetImpl(expandNodes);

        $variables.isShowMore = false;

      }
      else {
        $variables.isShowMore = true;

        await Actions.resetVariables(context, {
          variables: [
            '$variables.expandedNodes',
          ],
        });

      }
    }
  }

  return showMoreAC;
});