define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/saveProcess',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  SaveProcess,
  ActionUtils
) => {
  'use strict';

  class toolBarAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.taskId
     * @param {string} params.statusCode
     */
    async run(context, { taskId, statusCode }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const saveProcess = new SaveProcess();
      const toolBarResult = await saveProcess.getToolBar(taskId, statusCode);
            switch (toolBarResult) {
        case 'ERROR': {
          $variables.aToolGeneric = $constants.toolError;
          break;
        }
        case 'DRAFT': {
          $variables.aToolGeneric = $constants.toolDraft;
          break;
        }
        case "PENDING": {
          $variables.aToolGeneric = $constants.toolPending;
          break;
        }
        case "WITHDRAW": {
          $variables.aToolGeneric = $constants.toolWithDraw;
          break;
        }
        case "FINAL": {
          $variables.aToolGeneric = $constants.toolFinal;
          break;
        }
        default: {
          $variables.aToolGeneric = $constants.toolFinal;
          break;
        }
      }
    }
  }
  return toolBarAC;
});