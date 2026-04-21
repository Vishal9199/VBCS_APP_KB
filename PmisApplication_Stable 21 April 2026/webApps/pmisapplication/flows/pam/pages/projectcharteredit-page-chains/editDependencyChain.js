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

  class editDependencyChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {any} params.current
     * @param {any} params.index
     */
    async run(context, { event, originalEvent, key, current, index }) {
      const { $variables } = context;

      $variables.dependencyVar    = { ...current.row };
      $variables.isDependencyCreate = 'N';

      console.log('✏️ editDependencyChain: DEPENDENCY_ID =', current.row.dependency_id);

      const dialog = document.getElementById('dependencyDialog');
      if (dialog) dialog.open();
    }
  }

  return editDependencyChain;
});