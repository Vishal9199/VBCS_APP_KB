/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions'
], (
  ActionChain,
  Actions
) => {
  'use strict';

  class spSaveChain extends ActionChain {

    /**
     * Submit form data
     * @param {Object} context
     */
    async run(context) {
      const { $page }  = context;

      await Actions.navigateBack(context, {
      });
    }
  }

  return spSaveChain;
});
