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

  class selectSingleFunctionNameAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.key 
     * @param {any} params.data 
     * @param {any} params.metadata 
     */
    async run(context, { key, data, metadata }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.subMenuVar.function_name = data.function_name;

      await Actions.fireNotificationEvent(context, {
        summary: $variables.subMenuVar.function_name,
      });
    }
  }

  return selectSingleFunctionNameAC;
});
