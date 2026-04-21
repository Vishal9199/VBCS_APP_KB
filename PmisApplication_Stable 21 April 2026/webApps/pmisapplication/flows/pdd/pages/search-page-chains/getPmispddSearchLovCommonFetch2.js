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

  class getPmispddSearchLovCommonFetch2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{hookHandler:'vb/RestHookHandler'}} params.configuration
     */
    async run(context, { configuration }) {

      const { $variables } = context;

      // 🔎 Extract search text safely (type-ahead support)
      const searchText = configuration?.hookHandler?.context?.fetchOptions?.filterCriterion?.text || configuration;

      try {

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddSearchLovCommon',
          uriParams: {
            searchVal: searchText
          },
          headers: {
            'x-session-code': 'PROJECT'
          },
        });

        if (!response.ok) {
          await Actions.fireNotificationEvent(context, {
            summary: response.status,
            message: response.statusText,
            type: 'error'
          });
        }

        return response;

      } catch (error) {
        await Actions.fireNotificationEvent(context, {
          summary: 'REST Call Failed',
          message: error.message,
          type: 'error'
        });
      }
    }
  }

  return getPmispddSearchLovCommonFetch2;
});