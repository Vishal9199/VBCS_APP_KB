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

  class addRowAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const arr = $variables.projectAssignmentBDP.instance.lastIterator.mergedItemArray;

      if (!arr || arr.length === 0) {
        $page.variables.lvNextValue = 1;
      } else {
        const ids = arr
          .map(object => object.data.project_assignment_id)
          .filter(id => id !== null && id !== undefined && !isNaN(id) && id > 0);

        const max = ids.length > 0 ? Math.max(...ids) : 0;
        $page.variables.lvNextValue = max + 1;
      }

      const addItem = await $page.variables.projectAssignmentBDP.instance.addItem({
        metadata: {
          key: $variables.lvNextValue,
        },
        data: {
          'project_assignment_id': $variables.lvNextValue,
          'object_version_num': $variables.postAssignmentVar.object_version_num,
          'created_by': $variables.postAssignmentVar.created_by,
          'created_date': $variables.postAssignmentVar.created_date,
          'last_updated_by': $variables.postAssignmentVar.last_updated_by,
          'last_updated_date': $variables.postAssignmentVar.last_updated_date,
          'last_updated_login': $variables.postAssignmentVar.last_updated_login,
        },
      });

      $variables.rowToEdit.rowKey = $variables.lvNextValue;
    }
  }

  return addRowAction;
});