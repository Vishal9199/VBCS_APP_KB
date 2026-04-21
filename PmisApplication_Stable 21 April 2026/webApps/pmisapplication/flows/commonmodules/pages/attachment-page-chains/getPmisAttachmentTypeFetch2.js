define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class getPmisAttachmentTypeFetch extends ActionChain {

    async run(context, { configuration }) {

      let searchVal2 = configuration;

      // Extract LOV search text safely
      if (configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text) {
        searchVal2 = configuration.hookHandler.context.fetchOptions.filterCriterion.text;
      }

      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/getPmisAttachmentType',
        uriParams: {
          searchVal: searchVal2,
          'p_lookup_type_code': 'PMIS_FIVE_YEAR_ATTACHMENT_TYPE',
        },
      });

      return response;
    }
  }

  return getPmisAttachmentTypeFetch;
});