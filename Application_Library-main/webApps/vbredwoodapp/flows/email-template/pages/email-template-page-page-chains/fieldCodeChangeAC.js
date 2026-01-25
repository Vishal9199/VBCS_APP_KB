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

  class fieldCodeChangeAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;

       $variables.emailFieldVar.field_code = $variables.emailFieldVar.column_name;

      $variables.emailFieldVar.display_format = value.data.data_type;
    }

  }

  return fieldCodeChangeAC;
});
