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

  class onAddLessonRow extends ActionChain {

    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // ── Generate next temp negative key for new row ────────────────────
        const currentVal = $page.variables.lvNextLessonValue;

        if (currentVal === 9999999 || currentVal === null || currentVal === undefined || isNaN(currentVal)) {
          const arr = $page.variables.bufferDPlessonlearnedTable.instance.lastIterator?.mergedItemArray;

          if (arr && arr.length > 0) {
            const ids = arr.map(object => object.data.lesson_id);
            const min = Math.min(...ids);
            $page.variables.lvNextLessonValue = min < 0 ? min - 1 : -1;
          } else {
            $page.variables.lvNextLessonValue = -1;
          }
        } else {
          $page.variables.lvNextLessonValue = currentVal - 1;
        }

        console.log('lvNextLessonValue after calculation:', $page.variables.lvNextLessonValue);

        // ── Add new blank row to BufferingDataProvider ─────────────────────
        await $page.variables.bufferDPlessonlearnedTable.instance.addItem({
          metadata: {
            key: $page.variables.lvNextLessonValue,
          },
          data: {
            lesson_id: $page.variables.lvNextLessonValue,
            object_version_num: 0,
            ora_project_id: $page.variables.projectDetailsVar.ora_project_id,
            tender_id: $page.variables.projectDetailsVar.tender_id,
            period: '',
            lesson_date: null,
            lesson_type: '',
            lesson_category_id: null,
            lesson_status: '',
            lesson_impact: '',
            lesson_recommendation: '',
            logged_by: '',
            continuous_process: '',
            additional_info: '',
            created_by: $application.user.email,
            created_date: '',
            last_updated_by: $application.user.email,
            last_updated_date: '',
            last_updated_login: $application.user.email,
          },
        });

        console.log('Row added with key:', $page.variables.lvNextLessonValue);

        // ── Assign lessonRowToEdit.rowKey using Actions.assignVariable ──────
        await Actions.assignVariable(context, {
          variable: '$page.variables.lessonRowToEdit.rowKey',
          value: $page.variables.lvNextLessonValue,
        });

        console.log('lessonRowToEdit after set:', JSON.stringify($page.variables.lessonRowToEdit));

      } catch (error) {
        console.error('Error adding lesson row:', error);
      }
    }
  }

  return onAddLessonRow;
});