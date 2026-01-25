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

  class dec_CentralisedSecurity extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.plainText
     */
    async run(context, { plainText }) {
      const { $application, $constants, $variables, $functions } = context;


      try {

        let decryptJs = await $functions.decryptJs_Normal($constants.secretKey, plainText);

        return decryptJs;
      } catch (error) {
      } finally {
      }
    }
  }

  return dec_CentralisedSecurity;
});
