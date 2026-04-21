define([], () => {
  'use strict';

  class PageModule {

  }

  PageModule.prototype.percentConverter = {
    format: function (value) {
      return value != null ? value + ' %' : '';
    },
    parse: function (displayValue) {
      return displayValue ? parseFloat(displayValue.replace('%', '').trim()) : null;
    }
  };

  return PageModule;
});