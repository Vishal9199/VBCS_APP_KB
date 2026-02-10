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

    reorderFilterChips() {
        setTimeout(() => {
          const filterChips = document.querySelectorAll('.oj-sp-filter-chip');

          filterChips.forEach(chip => {
            const chipText = chip.textContent || chip.innerText;

            if (chipText.includes('Service Specific No')) {
              chip.classList.add('filter-order-1');
            } else if (chipText.includes('Project Number')) {
              chip.classList.add('filter-order-2');
            } else if (chipText.includes('Project Name')) {
              chip.classList.add('filter-order-3');
            }else if (chipText.includes('Tender Number')) {
              chip.classList.add('filter-order-4');
            }else if (chipText.includes('Tender Name')) {
              chip.classList.add('filter-order-5');
            }
          });
        }, 100);
      }
  
  }
  
  return PageModule;
});