// // define([
// //   'vb/action/actionChain',
// //   'vb/action/actions',
// //   'vb/action/actionUtils',
// // ], (
// //   ActionChain,
// //   Actions,
// //   ActionUtils
// // ) => {
// //   'use strict';

// //   class recalculateHeaderAmounts extends ActionChain {

// //     /**
// //      * Master calculation method - recalculates all header amounts
// //      * Call this after any line operation (add/update/delete)
// //      * 
// //      * @param {Object} context
// //      */
// //     async run(context) {
// //       const { $page, $variables } = context;
      
// //       console.log('🔢 Starting header calculations...');

// //       try {
// //         // ═══════════════════════════════════════════════════════
// //         // STEP 1: Calculate Receipt Amount
// //         // ═══════════════════════════════════════════════════════
// //         const receiptLines = $variables.receiptLineADP?.data || [];
// //         const receiptAmount = receiptLines.reduce((sum, line) => {
// //           return sum + (parseFloat(line.amount_in_omr) || 0);
// //         }, 0);
        
// //         $variables.payload.receipt_amt = receiptAmount;
// //         console.log('✅ Receipt Amount:', receiptAmount);

// //         // ═══════════════════════════════════════════════════════
// //         // STEP 2: Calculate Claim Amount
// //         // ═══════════════════════════════════════════════════════
// //         const claimLines = $variables.claimLineADP?.data || [];
// //         const claimAmount = claimLines.reduce((sum, line) => {
// //           return sum + (parseFloat(line.amount_in_omr) || parseFloat(line.line_amount) || 0);
// //         }, 0);
        
// //         $variables.payload.claim_amt = claimAmount;
// //         console.log('✅ Claim Amount:', claimAmount);

// //         // ═══════════════════════════════════════════════════════
// //         // STEP 3: Calculate Closing Balance
// //         // ═══════════════════════════════════════════════════════
// //         const openingBalance = parseFloat($variables.payload.open_balance_amt) || 0;
// //         const closingBalance = openingBalance + receiptAmount - claimAmount;
        
// //         $variables.payload.close_balance_amt = closingBalance;
// //         console.log('✅ Closing Balance:', closingBalance);

// //         // ═══════════════════════════════════════════════════════
// //         // STEP 4: Calculate Cash in Hand
// //         // ═══════════════════════════════════════════════════════
// //         const staffIOU = parseFloat($variables.payload.staff_iou_amt) || 0;
// //         const cashInHand = closingBalance - staffIOU;
        
// //         $variables.payload.cash_in_hand = cashInHand;
// //         console.log('✅ Cash in Hand:', cashInHand);

// //         // ═══════════════════════════════════════════════════════
// //         // STEP 5: Update Line Counts (Optional)
// //         // ═══════════════════════════════════════════════════════
// //         $variables.payload.receipt_line_count = receiptLines.length;
// //         $variables.payload.claim_line_count = claimLines.length;

// //         // ═══════════════════════════════════════════════════════
// //         // STEP 6: Validation Warnings
// //         // ═══════════════════════════════════════════════════════
// //         if (cashInHand < 0) {
// //           console.warn('⚠️ WARNING: Cash in Hand is NEGATIVE:', cashInHand);
          
// //           await Actions.fireNotificationEvent(context, {
// //             summary: 'Warning',
// //             message: 'Cash in Hand is negative! Please review your amounts.',
// //             type: 'warning',
// //             displayMode: 'transient'
// //           });
// //         }

// //         if (closingBalance < 0) {
// //           console.warn('⚠️ WARNING: Closing Balance is NEGATIVE:', closingBalance);
// //         }

// //         console.log('✅ All calculations completed:', {
// //           receiptAmount,
// //           claimAmount,
// //           openingBalance,
// //           closingBalance,
// //           staffIOU,
// //           cashInHand
// //         });

// //       } catch (error) {
// //         console.error('❌ Error in calculations:', error);
        
// //         await Actions.fireNotificationEvent(context, {
// //           summary: 'Calculation Error',
// //           message: 'Failed to recalculate header amounts: ' + error.message,
// //           type: 'error',
// //           displayMode: 'persistent'
// //         });
// //       }
// //     }
// //   }

// //   return recalculateHeaderAmounts;
// // });



// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class reCalculate_HeaderAmounts_AC extends ActionChain {

//     async run(context) {
//       const { $page, $variables } = context;

//       console.log('🔢 Recalculating header amounts...');

//       try {
//         const receiptLines = $variables.receiptLineADP?.data || [];
//         const claimLines = $variables.claimLineADP?.data || [];
//         const openingBalance = Number($variables.payload.open_balance_amt) || 0;
//         const staffIOU = Number($variables.payload.staff_iou_amt) || 0;

//         // ═══════════════════════════════════════════════════════════
//         // 1. Receipt Amount (Sum of RECEIPT_LINE_AMOUNT)
//         // ═══════════════════════════════════════════════════════════
        
//         const receiptAmount = receiptLines.reduce((sum, line) => {
//           const amount = Number(line.receipt_line_amount) || 0;
//           return sum + amount;
//         }, 0);

//         $variables.payload.receipt_amt = receiptAmount;
//         console.log('✅ Receipt Amount:', receiptAmount);

//         // ═══════════════════════════════════════════════════════════
//         // 2. Claim Amount (Sum of amount_in_omr or line_amount)
//         // ═══════════════════════════════════════════════════════════
        
//         const claimAmount = claimLines.reduce((sum, line) => {
//           const amount = Number(line.amount_in_omr) || Number(line.line_amount) || 0;
//           return sum + amount;
//         }, 0);

//         $variables.payload.claim_amt = claimAmount;
//         console.log('✅ Claim Amount:', claimAmount);

//         // ═══════════════════════════════════════════════════════════
//         // 3. Closing Balance = Opening + Receipts - Claims
//         // ═══════════════════════════════════════════════════════════
        
//         const closingBalance = openingBalance + receiptAmount - claimAmount;
//         $variables.payload.close_balance_amt = closingBalance;
//         console.log('✅ Closing Balance:', closingBalance);

//         // ═══════════════════════════════════════════════════════════
//         // 4. Cash in Hand = Closing Balance - Staff IOU
//         // ═══════════════════════════════════════════════════════════
        
//         const cashInHand = closingBalance - staffIOU;
//         $variables.payload.cash_in_hand = cashInHand;
//         console.log('✅ Cash in Hand:', cashInHand);

//         // ═══════════════════════════════════════════════════════════
//         // Validation Warnings
//         // ═══════════════════════════════════════════════════════════
        
//         if (cashInHand < 0) {
//           console.warn('⚠️ Cash in Hand is negative:', cashInHand);
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Warning: Negative Cash in Hand',
//             message: `Cash in Hand is ${cashInHand.toFixed(3)} OMR`,
//             type: 'warning',
//             displayMode: 'transient'
//           });
//         }

//         if (closingBalance < 0) {
//           console.warn('⚠️ Closing Balance is negative:', closingBalance);
//         }

//         console.log('📊 Summary:', {
//           opening: openingBalance,
//           receipts: receiptAmount,
//           claims: claimAmount,
//           closing: closingBalance,
//           staffIOU: staffIOU,
//           cashInHand: cashInHand
//         });

//       } catch (error) {
//         console.error('❌ Calculation error:', error);
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Calculation Error',
//           message: error.message,
//           type: 'error',
//           displayMode: 'transient'
//         });
//       }
//     }
//   }

//   return reCalculate_HeaderAmounts_AC;
// });



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

  class reCalculate_HeaderAmounts_AC extends ActionChain {

    /**
     * Recalculates all header amounts based on FDD specifications
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log('=== STARTING HEADER AMOUNT RECALCULATION (FDD FORMULAS) ===');

        // Get line data from Array Data Providers
        const claimLinesData = $variables.claimLineADP?.data || [];
        const receiptLinesData = $variables.receiptLineADP?.data || [];

        console.log(`📊 Claim Lines Count: ${claimLinesData.length}`);
        console.log(`📊 Receipt Lines Count: ${receiptLinesData.length}`);

        // =========================================================================
        // FDD FIELD #10: CLAIM AMOUNT
        // Formula: Total sum of the Claim lines amount
        // Database: Sum of amount_in_omr from xx_petty_cash_claim_lines_tbl
        // =========================================================================
        const claimAmount = claimLinesData.reduce((sum, line) => {
          const amount = Number(line.amount_in_omr) || 0;
          console.log(`  Claim Line: amount_in_omr = ${amount}`);
          return sum + amount;
        }, 0);

        console.log(`✅ Claim Amount (FDD Field #10): ${claimAmount}`);

        // =========================================================================
        // FDD FIELD #11: CLAIM LINES COUNT
        // Formula: Total number of the Claim lines
        // =========================================================================
        const claimLinesCount = claimLinesData.length;
        console.log(`✅ Claim Lines Count (FDD Field #11): ${claimLinesCount}`);

        // =========================================================================
        // FDD FIELD #8: RECEIPTS
        // Formula: Total sum of the Receipt Lines amount
        // Database: Sum of receipt_line_amount from xx_petty_cash_receipt_lines_tbl
        // =========================================================================
        const receiptAmount = receiptLinesData.reduce((sum, line) => {
          const amount = Number(line.receipt_line_amount) || 0;
          console.log(`  Receipt Line: receipt_line_amount = ${amount}`);
          return sum + amount;
        }, 0);

        console.log(`✅ Receipt Amount (FDD Field #8): ${receiptAmount}`);

        // =========================================================================
        // FDD FIELD #9: RECEIPT LINES COUNT
        // Formula: Total number of the Receipt Lines
        // =========================================================================
        const receiptLinesCount = receiptLinesData.length;
        console.log(`✅ Receipt Lines Count (FDD Field #9): ${receiptLinesCount}`);

        // =========================================================================
        // FDD FIELD #7: OPENING BALANCE
        // Source: Closing balance of the last petty cash claim
        // Note: Already set when header is created/loaded
        // =========================================================================
        const openingBalance = Number($variables.payload.opening_balance_amt) || 0;
        console.log(`✅ Opening Balance (FDD Field #7): ${openingBalance}`);

        // =========================================================================
        // FDD FIELD #12: CLOSING BALANCE/CASH IN HAND
        // Formula: Opening Balance + Receipts - Claim Amount
        // =========================================================================
        const closingBalance = openingBalance + receiptAmount - claimAmount;
        console.log(`✅ Closing Balance Calculation (FDD Field #12):`);
        console.log(`   ${openingBalance} (Opening) + ${receiptAmount} (Receipts) - ${claimAmount} (Claims) = ${closingBalance}`);

        // =========================================================================
        // STAFF IOU (User Entered Field)
        // Note: This is user-entered, not calculated
        // =========================================================================
        const staffIou = Number($variables.payload.staff_iou_amt) || 0;
        console.log(`ℹ️  Staff IOU: ${staffIou} (user entered)`);

        // =========================================================================
        // CASH IN HAND CALCULATION
        // Formula: Closing Balance - Staff IOU
        // Note: This is derived from Closing Balance, not explicitly in FDD
        // =========================================================================
        const cashInHand = closingBalance - staffIou;
        console.log(`✅ Cash in Hand: ${closingBalance} (Closing Balance) - ${staffIou} (Staff IOU) = ${cashInHand}`);

        // =========================================================================
        // UPDATE HEADER PAYLOAD WITH CALCULATED VALUES
        // Using direct assignment for performance (faster than Actions.assignVariables)
        // =========================================================================
        $variables.payload.receipt_amt = receiptAmount;
        $variables.payload.receipt_lines_count = receiptLinesCount;
        $variables.payload.claim_amt = claimAmount;
        $variables.payload.claim_lines_count = claimLinesCount;
        $variables.payload.close_balance_amt = closingBalance;
        $variables.payload.cash_in_hand = cashInHand;

        console.log('=== HEADER AMOUNTS UPDATED SUCCESSFULLY ===');
        console.log('📊 Summary:');
        console.log(`   Opening Balance: ${openingBalance}`);
        console.log(`   Receipt Amount: ${receiptAmount} (${receiptLinesCount} lines)`);
        console.log(`   Claim Amount: ${claimAmount} (${claimLinesCount} lines)`);
        console.log(`   Closing Balance: ${closingBalance}`);
        console.log(`   Staff IOU: ${staffIou}`);
        console.log(`   Cash in Hand: ${cashInHand}`);

        // =========================================================================
        // VALIDATION WARNING (FDD Field #48)
        // At least one expense claim line OR receipt line required to save
        // =========================================================================
        if (claimLinesCount === 0 && receiptLinesCount === 0) {
          console.warn('⚠️  FDD Validation: At least one claim line or receipt line is required');
        }

        // =========================================================================
        // CASH IN HAND NEGATIVE WARNING
        // Business Logic: Warn if cash in hand is negative
        // =========================================================================
        if (cashInHand < 0) {
          console.warn(`⚠️  Warning: Cash in Hand is negative (${cashInHand})`);
          console.warn(`   This indicates claims exceed available funds`);
          
          // Optional: Fire notification to user
          await Actions.fireNotificationEvent(context, {
            summary: 'Warning',
            message: `Cash in Hand is negative: ${cashInHand.toFixed(3)} OMR. Claims exceed available funds.`,
            type: 'warning',
            displayMode: 'persist'
          });
        }

      } catch (error) {
        console.error('❌ Error in reCalculate_HeaderAmounts_AC:', error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Calculation Error',
          message: `Failed to calculate header amounts: ${error.message}`,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return reCalculate_HeaderAmounts_AC;
});