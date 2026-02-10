define([], () => {
  'use strict';

  class PageModule {
  
    /**
     * Get today's date in ISO format
     * @return {string} ISO date string
     */
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      return isoDate;
    }

    /**
     * Get past date (2 months ago) in ISO format
     * @return {string} ISO date string
     */
    pastDate() {
      const now = new Date();
      // Subtract 2 months from the current date
      now.setMonth(now.getMonth() - 2);
      const isoDate = now.toISOString();
      return isoDate;
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @return {string} Formatted date string (dd-MMM-yyyy)
     */
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }

    /**
     * Calculate pagination info
     * @param {number} currentPage - Current page number
     * @param {number} pageSize - Number of records per page
     * @param {number} totalRecords - Total number of records
     * @return {object} Pagination information
     */
    getPaginationInfo(currentPage, pageSize, totalRecords) {
      const totalPages = Math.ceil(totalRecords / pageSize);
      const startRecord = ((currentPage - 1) * pageSize) + 1;
      const endRecord = Math.min(currentPage * pageSize, totalRecords);
      
      return {
        currentPage: currentPage,
        totalPages: totalPages,
        startRecord: startRecord,
        endRecord: endRecord,
        totalRecords: totalRecords,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages
      };
    }
  
  }
  
  return PageModule;
});