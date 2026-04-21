// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class getLookupValueLovByTypeFetch extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
//      */
//     async run(context, { configuration }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       const callRestEndpoint1 = await Actions.callRest(context, {
//         endpoint: 'AOL/getLookupValueLovByType',
//         responseType: 'getLookupValueLovByTypeResponse',
//         hookHandler: configuration.hookHandler,
//         requestType: 'json',
//       });

//       return callRestEndpoint1;
//     }
//   }

//   return getLookupValueLovByTypeFetch;
// });

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

  class getLookupValueLovByTypeFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let callRestEndpoint1;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        // WITH search/filter parameter
        callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'AOL/getLookupValueLovByType',
          uriParams: {
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
            'p_lookup_prefix': 'PMIS',
          },
          responseType: 'getLookupValueLovByTypeResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });
      } else {
        // WITHOUT search/filter parameter
        callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'AOL/getLookupValueLovByType',
          uriParams: {
            'search_var': configuration,
            'p_lookup_prefix': 'PMIS',
          },
          responseType: 'getLookupValueLovByTypeResponse',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });
      }

      return callRestEndpoint1;
    }
  }

  return getLookupValueLovByTypeFetch;
});