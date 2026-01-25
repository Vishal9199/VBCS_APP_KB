define([], () => {
  'use strict';

  class PageModule {
    /**
     * Format Function Code: uppercases and replaces spaces with underscores
     * @param {string} value - raw input from event.detail.value
     */
    formatFunctionCode(value) {
    return (value || '').toUpperCase().replace(/\s+/g, '_');
  }
  }

  return PageModule;
});
