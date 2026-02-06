define([], () => {
  'use strict';

  class PageModule {

    /**
     * Get current date in ISO format (YYYY-MM-DD)
     * @return {String} Current date in ISO format
     */
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return dateOnly;
    }

    /**
     * Get past date (2 months ago) in ISO format
     * @return {String} Date 2 months ago in ISO format
     */
    pastDate() {
      const now = new Date();
      // Subtract 2 months from the current date
      now.setMonth(now.getMonth() - 2);
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return dateOnly;
    }

    /**
     * Format date to dd-MMM-yyyy format
     * @param {String} dateString - Date string to format
     * @return {String} Formatted date string
     */
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    }

    /**
     * Generate pagination display text
     * @param {Number} offset - Current offset
     * @param {Number} currentCount - Records on current page
     * @param {Number} totalCount - Total records
     * @return {String} Pagination text (e.g., "1-10 of 20 items")
     */
    getPaginationText(offset, currentCount, totalCount) {
      if (totalCount === 0) {
        return "0-0 of 0 items";
      }
      
      const startIndex = offset + 1;
      const endIndex = offset + currentCount;
      
      return `${startIndex}-${endIndex} of ${totalCount} items`;
    }

    /**
     * Check if there's a next page
     * @param {Number} offset - Current offset
     * @param {Number} currentCount - Records on current page
     * @param {Number} totalCount - Total records
     * @return {Boolean} True if next page exists
     */
    hasNextPage(offset, currentCount, totalCount) {
      return (offset + currentCount) < totalCount;
    }

    /**
     * Check if there's a previous page
     * @param {Number} offset - Current offset
     * @return {Boolean} True if previous page exists
     */
    hasPreviousPage(offset) {
      return offset > 0;
    }

    /**
     * Calculate next page offset
     * @param {Number} offset - Current offset
     * @param {Number} limit - Records per page
     * @return {Number} Next page offset
     */
    getNextOffset(offset, limit) {
      return offset + limit;
    }

    /**
     * Calculate previous page offset
     * @param {Number} offset - Current offset
     * @param {Number} limit - Records per page
     * @return {Number} Previous page offset
     */
    getPreviousOffset(offset, limit) {
      const newOffset = offset - limit;
      return newOffset < 0 ? 0 : newOffset;
    }

    /**
     * Validate search parameters
     * @param {Object} searchObj - Search parameters object
     * @return {Object} Validation result {isValid: boolean, message: string}
     */
    validateSearchParams(searchObj) {
      // Check if at least one search parameter is provided
      const hasRegionName = searchObj.p_region_name && searchObj.p_region_name !== '';
      const hasProjectNumber = searchObj.p_project_number && searchObj.p_project_number !== '';
      const hasTenderNumber = searchObj.p_tender_number && searchObj.p_tender_number !== '';
      const hasRegionalManager = searchObj.p_responsible_person && searchObj.p_responsible_person !== '';
      const hasKeyword = searchObj.p_keyword && searchObj.p_keyword !== '';

      if (!hasRegionName && !hasProjectNumber && !hasTenderNumber && !hasRegionalManager && !hasKeyword) {
        return {
          isValid: false,
          message: 'Please select at least one search filter or enter a keyword'
        };
      }

      return {
        isValid: true,
        message: 'Validation passed'
      };
    }

    /**
     * Clean search object - remove empty/null values
     * @param {Object} searchObj - Search parameters object
     * @return {Object} Cleaned search object
     */
    cleanSearchObject(searchObj) {
      const cleaned = {};
      
      Object.keys(searchObj).forEach(key => {
        const value = searchObj[key];
        if (value !== null && value !== undefined && value !== '') {
          cleaned[key] = value;
        }
      });

      // Always include pagination parameters
      cleaned.in_limit = searchObj.in_limit || '10';
      cleaned.in_offset = searchObj.in_offset || '0';

      return cleaned;
    }

    /**
     * Reset search parameters to default
     * @return {Object} Default search object
     */
    getDefaultSearchObject() {
      return {
        in_limit: '10',
        in_offset: '0',
        p_region_id: '',
        p_region_name: '',
        p_project_id: '',
        p_project_number: '',
        p_tender_number: '',
        p_tender_name: '',
        p_responsible_person: '',
        p_person_id: '',
        p_created_by: '',
        p_keyword: ''
      };
    }

    /**
     * Log search parameters for debugging
     * @param {Object} searchObj - Search parameters object
     */
    logSearchParams(searchObj) {
      console.group('Region Search Parameters');
      console.log('Pagination:');
      console.log('  - Limit:', searchObj.in_limit);
      console.log('  - Offset:', searchObj.in_offset);
      console.log('Filter Values:');
      console.log('  - Region Name:', searchObj.p_region_name || 'Not set');
      console.log('  - Project Number:', searchObj.p_project_number || 'Not set');
      console.log('  - Tender Number:', searchObj.p_tender_number || 'Not set');
      console.log('  - Regional Manager:', searchObj.p_responsible_person || 'Not set');
      console.log('  - Keyword:', searchObj.p_keyword || 'Not set');
      console.groupEnd();
    }

    /**
     * Format number with thousand separators
     * @param {Number} num - Number to format
     * @return {String} Formatted number string
     */
    formatNumber(num) {
      if (num === null || num === undefined) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Truncate text to specified length
     * @param {String} text - Text to truncate
     * @param {Number} maxLength - Maximum length
     * @return {String} Truncated text with ellipsis
     */
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }

    /**
     * Check if search has been performed
     * @param {Object} searchObj - Search parameters object
     * @return {Boolean} True if search parameters exist
     */
    isSearchPerformed(searchObj) {
      return searchObj.p_region_name !== '' ||
             searchObj.p_project_number !== '' ||
             searchObj.p_tender_number !== '' ||
             searchObj.p_responsible_person !== '' ||
             searchObj.p_keyword !== '';
    }

    /**
     * Generate export filename with timestamp
     * @return {String} Filename for Excel export
     */
    getExportFilename() {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
      return `Region_Export_${timestamp}.xlsx`;
    }

    /**
     * Validate region ID
     * @param {Number} regionId - Region ID to validate
     * @return {Object} Validation result {isValid: boolean, message: string}
     */
    validateRegionId(regionId) {
      if (!regionId || regionId === 0) {
        return {
          isValid: false,
          message: 'Region ID is required'
        };
      }

      if (isNaN(regionId)) {
        return {
          isValid: false,
          message: 'Region ID must be a number'
        };
      }

      return {
        isValid: true,
        message: 'Valid Region ID'
      };
    }

  }

  return PageModule;
});