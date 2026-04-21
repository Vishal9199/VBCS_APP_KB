define([], () => {
  'use strict';

  class PageModule {

    formatDisplayDate(dateStr) {
      if (!dateStr) return '';

      // Handle both "2026-02-05T00:00:00Z" and "05-02-26" and "2026-02-05"
      let date;

      if (dateStr.includes('T')) {
        // ISO format: 2026-02-05T00:00:00Z
        date = new Date(dateStr);
      } else if (dateStr.length === 8 && dateStr.split('-')[2].length === 2) {
        // Backend short format: 05-02-26 (DD-MM-YY)
        const parts = dateStr.split('-');
        date = new Date(`20${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // Standard: 2026-02-05
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) return dateStr;

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).replace(/ /g, '-'); // "05-Feb-2026"
    }
  }

  return PageModule;
});
