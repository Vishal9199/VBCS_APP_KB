define([], () => {
  'use strict';

  class PageModule {

    
        getDisplayNum(data) {
      if (!Array.isArray(data) || data.length === 0) {
        return 1;
      }

      const lastRecord = data[data.length - 1];
      return lastRecord.entry_sequence + 1;
  }
  }
  return PageModule;
});
