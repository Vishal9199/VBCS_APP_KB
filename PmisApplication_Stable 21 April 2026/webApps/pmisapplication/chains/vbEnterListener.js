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

  class vbEnterListener extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $application, $constants, $variables } = context;


      const response = await Actions.callRest(context, {
        endpoint: 'PAM/getPmispamLovUsers',
        uriParams: {
          searchVal: $application.user.email,
          // searchVal: 'Mohammed.Al-Mazroui@testowwsc.nama.om',
        },
      });

      $variables.getEmployeeDetailTypeVar = response.body.items[0];
    }
  }

  return vbEnterListener;
});
