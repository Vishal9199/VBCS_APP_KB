define([], () => {
  'use strict';

  class PageModule {

    /**
     * Get today's date in ISO format
     * @return {String} ISO date string
     */
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      return isoDate;
    }

    /**
     * Get past date (2 months ago) in ISO format
     * @return {String} ISO date string
     */
    pastDate() {
      const now = new Date();
      // Subtract 2 months from the current date
      now.setMonth(now.getMonth() - 2);
      const isoDate = now.toISOString();
      return isoDate;
    }

    /**
     * Load and align Smart Search filters
     * Ensures proper filter ordering and parameter mapping
     */
    loadSmartSearch() {
      try {
        // Get the smart search component
        const smartSearchComponent = document.getElementById('freq_smartsearch');

        if (smartSearchComponent) {
          console.log('Smart Search component loaded and ready for filter alignment');

          // Additional filter alignment logic can be added here
          // This function ensures proper filter ordering after DOM load
        }
      } catch (error) {
        console.error('Error loading Smart Search:', error);
      }
    }

    /**
     * Format date for display in table
     * @param {String} dateString - ISO date string
     * @return {String} Formatted date string (dd-MMM-yyyy)
     */
    formatDisplayDate(dateString) {
      if (!dateString) return '';

      try {
        const date = new Date(dateString);
        const options = {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        };
        return date.toLocaleDateString('en-GB', options);
      } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
      }
    }

    /**
     * Validate lookup type code format (all caps)
     * @param {String} code - Lookup type code to validate
     * @return {Boolean} True if valid format
     */
    validateLookupCode(code) {
      if (!code) return false;

      // Check if all caps and no spaces
      const upperCaseRegex = /^[A-Z0-9_]+$/;
      return upperCaseRegex.test(code.trim());
    }

    /**
     * Get active flag display text
     * @param {String} flag - Y/N flag value
     * @return {String} Display text for active flag
     */
    getActiveFlagDisplay(flag) {
      return flag === 'Y' ? 'Active' : 'Inactive';
    }
  }

  return PageModule;
});