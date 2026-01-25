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

  class claimLineAmountChange_AC extends ActionChain {

    /**
     * Calculate amount_in_omr when amount changes
     * @param {Object} context
     * @param {Object} params
     */
    async run(context, { event, previousValue, value, updatedFrom }) {
      const { $page, $variables } = context;

      console.log('💰 Amount changed:', {
        previousValue,
        newValue: value,
        currency: $page.variables.claimLineForm.currency
      });

      try {
        // Get current form values
        const amount = value || $page.variables.claimLineForm.amount;
        const exchangeRate = $page.variables.claimLineForm.exchange_rate || 1;
        const currency = $page.variables.claimLineForm.currency;

        // Calculate amount_in_omr
        let amountInOmr = 0;

        if (currency === 'OMR') {
          // If currency is OMR, amount_in_omr = amount
          amountInOmr = Number(amount) || 0;
        } else {
          // For other currencies, multiply by exchange rate
          const numAmount = Number(amount) || 0;
          const numRate = Number(exchangeRate) || 1;
          
          amountInOmr = numAmount * numRate;
          
          if (isNaN(amountInOmr)) {
            amountInOmr = 0;
          }
        }

        // Update amount_in_omr
        $variables.claimLineForm.amount_in_omr = amountInOmr;

        console.log('✅ Amount in OMR calculated:', amountInOmr);

      } catch (error) {
        console.error('❌ Error calculating amount in OMR:', error);
        
        $variables.claimLineForm.amount_in_omr = 0;
      }
    }
  }

  return claimLineAmountChange_AC;
});