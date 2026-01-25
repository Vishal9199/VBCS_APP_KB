define([], () => {
  'use strict';

  class PageModule {
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return isoDate;
    }

    pastDate() {
      const now = new Date();
      // Subtract 2 months from the current date
      // now.setMonth(now.getMonth() - 2);
      now.setDate(now.getDate() - 7);
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return isoDate;
    }
  }
  
  return PageModule;
});
