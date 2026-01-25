define([], () => {
  'use strict';

  class PageModule {


    getSysdate() {
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0');
      let yyyy = today.getFullYear();
      today = yyyy + '-' + mm + '-' + dd;
      return today;
    }
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
      return +lastRecord.sequence_no + 1;

    }

  }

  return PageModule;
});
