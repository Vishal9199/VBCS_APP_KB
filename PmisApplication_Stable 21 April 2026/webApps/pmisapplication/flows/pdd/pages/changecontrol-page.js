define([], () => {
  'use strict';

  class PageModule {

    /**
     * Pure calculation function
     * @param {number} additionA
     * @param {number} omissionB
     * @param {number} originalContractValue
     * @returns {object}
     */
    calculateChangeValues(additionA, omissionB, originalContractValue) {

      let a = Number(additionA) || 0;
      let b = Number(omissionB) || 0;
      let base = Number(originalContractValue) || 0;

      let totalChange = a + b;
      let netChange = a - b;

      let netPercent = 0;
      let totalVol = 0;

      if (base !== 0) {
        netPercent = netChange / base;
        totalVol = (totalChange / base) * 100;
      }

      return {
        total_change: totalChange,
        net_change: netChange,
        net_percentage_of_change: netPercent,
        total_vol_of_change: totalVol
      };
    }

  }

  return PageModule;
});