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

  class TableBeforeRowEditEndChain extends ActionChain {

    async run(context, { changedRow, cancelEdit, event, rowData, rowKey, rowIndex }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const lessonCategoryId = changedRow?.lesson_category_id ?? rowData?.lesson_category_id;
      const lessonImpact = changedRow?.lesson_impact ?? rowData?.lesson_impact;

      if (!lessonCategoryId) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error: Lesson Category is required.',
          type: 'error',
          displayMode: 'transient',
        });
        cancelEdit(false); // keep row in edit mode
        return;
      }

      if (!lessonImpact || String(lessonImpact).trim() === '') {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Error: Lesson Impact is required.',
          type: 'error',
          displayMode: 'transient',
        });
        cancelEdit(false); // keep row in edit mode
        return;
      }

      $variables.count = $variables.count + 1;

      await $page.variables.bufferDPlessonlearnedTable.instance.updateItem({
        metadata: {
          key: rowKey,
        },
        data: changedRow,
      });
    }
  }

  return TableBeforeRowEditEndChain;
});