define([], () => {
  'use strict';

  class PageModule {
  
    /**
     * Returns today's date in ISO format
     * Used for DateRangeFilter endDate default value
     * @returns {string} ISO formatted date string (YYYY-MM-DD)
     */
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return isoDate;
    }

    /**
     * Returns date from 2 months ago in ISO format
     * Used for DateRangeFilter startDate default value
     * @returns {string} ISO formatted date string (YYYY-MM-DD)
     */
    pastDate() {
      const now = new Date();
      // Subtract 2 months from the current date
      now.setMonth(now.getMonth() - 2);
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return isoDate;
    }
  
  }
  
  return PageModule;
});