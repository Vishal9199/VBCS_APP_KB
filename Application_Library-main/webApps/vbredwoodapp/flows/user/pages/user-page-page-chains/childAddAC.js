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

  class childAddAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.originalEvent
     */
    async run(context, { event, originalEvent }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      await Actions.resetVariables(context, {
        variables: [
    '$variables.userAccessChildVar',
  ],
      });

      $variables.userAccessChildVar.user_name = $variables.userAccessDetailHeaderVar.user_name;

      $variables.userAccessChildVar.active_flag = 'Y';

      const sdp = await Actions.callRest(context, {
        endpoint: 'Role/getAol_usrRoleLovRolename',
        headers: {
          'p_user_id': $variables.userAccessDetailHeaderVar.user_id,
        },
      });

      const userAccessDetailsDialogSetProperty = await Actions.callComponentMethod(context, {
        selector: '#userAccessDetailsDialog',
        method: 'setProperty',
        params: [ 'method' ,'POST'],
      });

      $variables.user_hide = 'create';

      await Actions.fireDataProviderEvent(context, {
        target: $variables.getAolUsrRoleLovRolenameListSDP2,
        refresh: null,
      });

      if (sdp.body.count >= 1) {

        const userAccessDetailsDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#userAccessDetailsDialog',
          method: 'open',
        });
      } else {
         const result = true;

         await Actions.fireNotificationEvent(context, {
           summary: 'All Role Has Been Added',
           type: 'info',
         });

        return result;
      }

    }
  }

  return childAddAC;
});
