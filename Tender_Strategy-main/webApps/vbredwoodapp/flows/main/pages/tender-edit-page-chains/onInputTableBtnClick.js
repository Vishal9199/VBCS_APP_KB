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

  class onInputTableBtnClick extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const tablePopupOpen = await Actions.callComponentMethod(context, {
        selector: '#tablePopup',
        method: 'open',
      });

      await Actions.resetVariables(context, {
        variables: [
          '$variables.inputTable',
          '$variables.matrixData',
        ],
      });

    }
  }

  return onInputTableBtnClick;
});
