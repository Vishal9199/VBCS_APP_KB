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

  class AddAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.payload.user_email_id = $variables.searchObjTemp.P_USER_EMAIL_ID;

      $variables.payload.request_type = $variables.searchObjTemp.P_REQUEST_TYPE;

      $variables.payload.active_flag = 'Y';

      const ojDialog11939268691Open = await Actions.callComponentMethod(context, {
        selector: '#oj-dialog--1193926869-1',
        method: 'open',
      });
    }
  }

  return AddAC;
});