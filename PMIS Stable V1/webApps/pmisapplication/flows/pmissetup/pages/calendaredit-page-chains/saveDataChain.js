/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
], ActionChain => {
  'use strict';

  class saveDataChain extends ActionChain {

    /**
     * <--Fill in custom save data logic in this action chain-->
     * @param {Object} context
     */
    async run() {
      // const { $page, $flow, $application } = context;
    }
  }

  return saveDataChain;
});
