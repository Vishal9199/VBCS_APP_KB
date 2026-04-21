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

  class encryptAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.input
     */
    async run(context, { input = '0' }) {
      const { $application, $constants, $variables, $functions } = context;

      const encryptedText = await $functions.encryptJs(input, $constants.secretKey, $constants.time, $constants.unit);

      return encryptedText;
    }
  }

  return encryptAC;
});