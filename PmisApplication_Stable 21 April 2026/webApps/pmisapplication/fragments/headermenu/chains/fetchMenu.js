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

  class fetchMenu extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $fragment, $application, $constants, $variables, $functions } = context;
      if (($application.constants.appType === 'LOCAL_DEV')) {
        $variables.loginUser = $constants.developerUser;
      } else {
        $variables.loginUser = $application.user.email;
      }

      const encryptJs = await $application.functions.encryptJs($variables.loginUser, $application.constants.secretKey, $application.constants.time, $application.constants.unit);

      console.log("encryptJs==>"+encryptJs);


      const response = await Actions.callRest(context, {
        endpoint: 'PmisSetup/getUserMenu',
        headers: {
          'x-cache-id': encryptJs,
        },
      });
      // console.log("response==>"+JSON.stringify(response, null, 2));
      // console.log("response==>"+response);
      return response;


    }
  }

  return fetchMenu;
});