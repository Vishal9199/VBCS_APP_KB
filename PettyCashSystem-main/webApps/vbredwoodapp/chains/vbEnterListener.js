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
      const { $application, $constants, $variables, $functions } = context;


      try {
        const results = await Promise.all([
          async () => {

            const response = await Actions.callRest(context, {
              endpoint: 'ORDS/getNws_custPettycashLovDatarestriction',
              uriParams: {
                'p_user': $variables.userLogin,
              },
            });

            $variables.getDatarestrictionTypeVar = response.body.items[0];
            $variables.restricted_business_unit = $functions.getWaterCategory(response.body.items[0].restriction_name);
          },
          async () => {

            const response2 = await Actions.callRest(context, {
              endpoint: 'ORDS/getNws_custCommonLovEmployeeDetail',
              uriParams: {
                searchVal: $variables.userLogin,
              },
            });

            $variables.getEmployeeDetailTypeVar = response2.body.items[0];
          },
          async () => {

            const enc_mail = await Actions.callChain(context, {
              chain: 'encLargePayloadWithTime',
              params: {
                plainText: $variables.userLogin,
              },
            });

            $variables.enc_UserLogin = enc_mail;
          },
        ].map(sequence => sequence()));
      } catch (error) {
      } finally {
      }
    }
  }

  return vbEnterListener;
});
