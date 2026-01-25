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

  class loadChildTableAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.searchParameterObj.p_program_id = $variables.programVar.program_id;
      $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.searchParameterObj);

      const response = await Actions.callRest(context, {
        endpoint: 'Program/postProgramParamSearch',
        body: $variables.encryptedBody,
      });

      $variables.ADPprogramParameters.data= response.body.P_OUTPUT;

      $variables.pagination.prev = +$variables.searchParameterObj.in_offset > 0;
      $variables.pagination.next = response.body.OUT_HAS_NEXT === "Y";

    }
  }

  return loadChildTableAC;
});
