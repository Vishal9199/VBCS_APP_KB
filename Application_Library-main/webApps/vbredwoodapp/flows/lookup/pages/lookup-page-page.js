define([], () => {
  'use strict';

  class PageModule {
    normalizeDate(dateValue) {
      if (!dateValue) {
        return ""; // handles null or empty
      }

      // If it contains 'T' (timestamp format), split and take only the date
      if (typeof dateValue === "string" && dateValue.includes("T")) {
        return dateValue.split("T")[0];
      }

      // Otherwise, return as-is (already a date like "4712-12-31")
      return dateValue;
    }

    getDisplayNum(data) {
      if (!Array.isArray(data) || data.length === 0) {
        return 1;
      }

      const lastRecord = data[data.length - 1];
      return lastRecord.display_order + 1;

    }

  }

  return PageModule;
});
