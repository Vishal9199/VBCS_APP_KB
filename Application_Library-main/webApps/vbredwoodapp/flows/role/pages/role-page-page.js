define([], () => {
  'use strict';

  class PageModule {
     getNextDay(dateString) {
      // Convert input to Date object
      let date = new Date(dateString);

      // Add 1 day
      date.setDate(date.getDate() + 1);

      // Format as YYYY-MM-DD
      let yyyy = date.getFullYear();
      let mm = String(date.getMonth() + 1).padStart(2, '0');
      let dd = String(date.getDate()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd}`;
    }
  }
  
  return PageModule;
});
