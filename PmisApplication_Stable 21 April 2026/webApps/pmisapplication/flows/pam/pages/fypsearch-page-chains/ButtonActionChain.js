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

  class ButtonActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     * @param {any} params.key
     * @param {number} params.index
     * @param {any} params.current
     */
    async run(context, { event, originalEvent, key, index, current }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let temp_key = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: key,
        },
      });

      if (current.row.calendar_type_code === 'FIVE_YEAR_PLAN') {

        const toFypedit = await Actions.navigateToPage(context, {
          page: 'fypedit',
          params: {
            pNavCode: 'EDIT',
            pNavId: temp_key,
            pNavPrjId: current.row.project_id,
          },
        });
      } else if (current.row.calendar_type_code === 'THREE_YEAR_PLAN') {

        const toFypedit2 = await Actions.navigateToPage(context, {
          page: 'tyedit',
          params: {
            pNavCode: 'EDIT',
            pNavId: temp_key,
            pNavPrjId: current.row.project_id,
          },
        });
      }
    }
  }

  return ButtonActionChain;
});
