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

  class TableBeforeRowEditChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.accept
     * @param {object} params.rowContext
     * @param {any} params.rowKey
     * @param {number} params.rowIndex
     * @param {any} params.rowData
     */
    async run(context, { event, accept, rowContext, rowKey, rowIndex, rowData }) {
      const { $page, $flow, $application, $constants, $variables } = context;

            $variables.lvCurrentLessonRow = rowData;
    }
  }

  return TableBeforeRowEditChain;
});
