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

  class IconMouseoverChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.errorcode = current.row.err_msg;

      const errorOpen = await Actions.callComponentMethod(context, {
        selector: '#error',
        method: 'open',
      });
    }
  }

  return IconMouseoverChain;
});
