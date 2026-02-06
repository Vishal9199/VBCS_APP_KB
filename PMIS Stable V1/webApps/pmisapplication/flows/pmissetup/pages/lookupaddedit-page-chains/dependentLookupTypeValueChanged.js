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

  class dependentLookupTypeValueChanged extends ActionChain {
    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value
     * @param {any} params.data
     * @param {any} params.event
     * @param {any} params.key
     * @param {any} params.valueItem
     */
    async run(context, { value, data, event, key, valueItem }) {
      const { $page, $variables, $current } = context;

  //     await Actions.resetVariables(context, {
    //       variables: [
    //   '$variables.lookupValueVar.dependent_lookup_value_id',
    // ],
    //     });
  
    //     // Refresh dropdown if value selected
    //     if (value) {
    //       await Actions.fireDataProviderEvent(context, {
    //         target: $variables.getDependentLookupValueListSDP,
    //         refresh: null,
    //       });
    //     }
    console.log("Check key ID", key);
    }
  }

  return dependentLookupTypeValueChanged;
});