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

  class getLookupPmisLovDependLookupvalueFetch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {
      const { $page, $flow, $application, $constants, $variables } = context;
      let callRestEndpoint1;

      if (configuration.hookHandler.context.fetchOptions.filterCriterion) {
        callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'AOL/getLookupPmisLovDependLookupvalue',
          uriParams: {
            'p_dependent_lookup_type_code': $variables.lookupTypeVar.dependent_lookup_type_code,
            'search_var': configuration.hookHandler.context.fetchOptions.filterCriterion.text,
          },
          responseType: 'getLookupPmisLovDependLookupvalue',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });
      } else {
        callRestEndpoint1 = await Actions.callRest(context, {
          endpoint: 'AOL/getLookupPmisLovDependLookupvalue',
          uriParams: {
            'p_dependent_lookup_type_code': $variables.lookupTypeVar.dependent_lookup_type_code,
          },
          responseType: 'getLookupPmisLovDependLookupvalue',
          hookHandler: configuration.hookHandler,
          requestType: 'json',
        });
      }

      return callRestEndpoint1;
    }
  }

  return getLookupPmisLovDependLookupvalueFetch;
});


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

//   class getLookupPmisLovDependLookupvalueFetch extends ActionChain {

//     /**
//      * @param {Object} context
//      * @param {Object} params
//      * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
//      */
//     async run(context, { configuration }) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       const callRestEndpoint1 = await Actions.callRest(context, {
//         endpoint: 'AOL/getLookupPmisLovDependLookupvalue',
//         uriParams: {
//           'p_dependent_lookup_type_code': $variables.lookupTypeVar.dependent_lookup_type_code,
//         },
//         responseType: 'getLookupPmisLovDependLookupvalue',
//         hookHandler: configuration.hookHandler,
//         requestType: 'json',
//       });

//       return callRestEndpoint1;
//     }
//   }

//   return getLookupPmisLovDependLookupvalueFetch;
// });