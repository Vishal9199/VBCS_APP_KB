define([], () => {
  'use strict';

  class PageModule {
  
    /**
     * Returns today's date in ISO format
     * @return {String} ISO date string
     */
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      return isoDate;
    }

    /**
     * Returns date from 2 months ago in ISO format
     * @return {String} ISO date string
     */
    pastDate() {
      const now = new Date();
      // Subtract 2 months from the current date
      now.setMonth(now.getMonth() - 2);
      const isoDate = now.toISOString();
      return isoDate;
    }
  
  }
  
  return PageModule;
});