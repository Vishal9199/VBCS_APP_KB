define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class claimLineRateChange_AC extends ActionChain {

    /**
     * Calculate amount_in_omr when exchange rate changes
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {number} params.previousValue - Previous exchange rate value
     * @param {any} params.value - New exchange rate value
     * @param {string} params.updatedFrom
     */
    async run(context, { event, previousValue, value, updatedFrom }) {
      const { $page, $application, $variables } = context;

      console.log('🔄 Exchange rate changed:', {
        previousValue,
        newValue: value,
        currency: $page.variables.claimLineForm.currency,
        currentAmount: $page.variables.claimLineForm.amount
      });

      try {
        // Get current form values
        const amount = $page.variables.claimLineForm.amount;
        const exchangeRate = value || $page.variables.claimLineForm.exchange_rate;
        const currency = $page.variables.claimLineForm.currency;

        // Validate inputs
        if (amount == null || amount <= 0) {
          console.log('⚠️ No valid amount to calculate');
          return;
        }

        // ✅ Calculate amount_in_omr
        let amountInOmr = 0;

        if (currency === 'OMR') {
          // If currency is OMR, exchange rate should be 1
          amountInOmr = Number(amount) || 0;
          
          // Auto-set exchange rate to 1 for OMR
          $variables.claimLineForm.exchange_rate = 1;
          
          console.log('💰 OMR currency - no conversion needed');
        } else {
          // For other currencies, multiply by exchange rate
          const numAmount = Number(amount) || 0;
          const numRate = Number(exchangeRate) || 1;
          
          amountInOmr = numAmount * numRate;
          
          // Ensure result is not NaN
          if (isNaN(amountInOmr)) {
            amountInOmr = 0;
            console.warn('⚠️ Calculation resulted in NaN, setting to 0');
          }
          
          console.log('💱 Currency conversion:', {
            amount: numAmount,
            rate: numRate,
            result: amountInOmr
          });
        }

        // ✅ Update amount_in_omr in the form
        $variables.claimLineForm.amount_in_omr = amountInOmr;

        console.log('✅ Amount in OMR calculated:', amountInOmr);

      } catch (error) {
        console.error('❌ Error calculating amount in OMR:', error);
        
        // Set to 0 on error to prevent NaN
        $variables.claimLineForm.amount_in_omr = 0;
      }
    }
  }

  return claimLineRateChange_AC;
});