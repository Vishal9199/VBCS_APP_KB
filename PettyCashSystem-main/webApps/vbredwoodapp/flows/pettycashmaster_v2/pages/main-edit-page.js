define([], () => {
  'use strict';

  class PageModule {

    getWaterCategory(str) {
      if (!str) return "NONE";

      const val = str.toLowerCase();

      if (val.includes("waste")) {
        return "Waste Water Operation Unit";
      } else if (val.includes("water")) {
        return "Water Operating Unit";
      }

      return "NONE";
    }

    /**
     * Compares two Petty Cash Header payloads including ALL fields
     * Returns "Y" if payloads are identical, "N" if different
    **/
    
    comparePettyCashHeaderPayloads(payload1, payload2) {
      let result;
      
      // =========================================================================
      // DATE FORMATTING HELPER
      // Ensures consistent date comparison (YYYY-MM-DD format) // Handles ISO strings, Date objects, null/undefined
      // =========================================================================
      const formatDate = (date) => {
        if (date === null || date === undefined) {
          return date;
        }
        
        // Handle ISO string format (2025-11-18T16:39:15Z)
        if (typeof date === 'string' && date.includes('T')) {
          return date.split('T')[0]; // Extract YYYY-MM-DD part
        }
        
        // Handle Date object
        if (date instanceof Date) {
          return date.toISOString().slice(0, 10);
        }
        
        // Handle already formatted string (YYYY-MM-DD)
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date;
        }
        
        // Attempt to parse as Date
        try {
          const formattedDate = new Date(date);
          if (!isNaN(formattedDate.getTime())) {
            return formattedDate.toISOString().slice(0, 10);
          }
          return date;
        } catch (e) {
          return date; // Return as-is if parsing fails
        }
      };

      // =========================================================================
      // NUMBER FORMATTING HELPER
      // Ensures consistent number comparison
      // Handles strings, null, undefined, empty strings
      // Rounds to 3 decimal places (OMR standard)
      // =========================================================================
      const formatNumber = (num) => {
        if (num === null || num === undefined || num === '') {
          return 0;
        }
        const parsed = Number(num);
        if (isNaN(parsed)) {
          return 0;
        }
        // Round to 3 decimal places (OMR currency standard)
        return Math.round(parsed * 1000) / 1000;
      };

      // =========================================================================
      // STRING FORMATTING HELPER // Ensures consistent string comparison // Trims whitespace, handles null/undefined
      // =========================================================================
      const formatString = (str) => {
        if (str === null || str === undefined) {
          return '';
        }
        return String(str).trim();
      };

      // =========================================================================
      // PAYLOAD 1 - ALL BUSINESS FIELDS (Normalized)
      // =========================================================================
      const jsonProps1 = JSON.stringify({
        
        // === DATES ===
        request_date: formatDate(payload1.request_date),
        
        // === CLAIM CONFIGURATION ===
        // petty_cash_type: formatString(payload1.petty_cash_type),
        governorate: formatString(payload1.governorate),
        
        // === SUPPLIER INFORMATION ===
        supplier_id: formatNumber(payload1.supplier_id),
        
        // === FINANCIAL AMOUNTS (AUTO-CALCULATED) ===
        open_balance_amt: formatNumber(payload1.open_balance_amt),
        receipt_amt: formatNumber(payload1.receipt_amt),
        claim_amt: formatNumber(payload1.claim_amt),
        staff_iou_amt: formatNumber(payload1.staff_iou_amt),
        close_balance_amt: formatNumber(payload1.close_balance_amt),
        cash_in_hand: formatNumber(payload1.cash_in_hand),
        
        // === COMMENTS (USER-EDITABLE) ===
        comments: formatString(payload1.comments),
        
        // === LINE COUNTS (AUTO-CALCULATED) ===
        line_count: formatNumber(payload1.line_count),
        receipt_count: formatNumber(payload1.receipt_count)
      });

      // =========================================================================
      // PAYLOAD 2 - ALL BUSINESS FIELDS (Normalized, Same structure as Payload 1)
      // =========================================================================
      const jsonProps2 = JSON.stringify({
        
        // === DATES ===
        request_date: formatDate(payload2.request_date),
        
        // === CLAIM CONFIGURATION ===
        petty_cash_type: formatString(payload2.petty_cash_type),
        governorate: formatString(payload2.governorate),
        
        // === SUPPLIER INFORMATION ===
        supplier_id: formatNumber(payload2.supplier_id),
        
        // === FINANCIAL AMOUNTS (AUTO-CALCULATED) ===
        open_balance_amt: formatNumber(payload2.open_balance_amt),
        receipt_amt: formatNumber(payload2.receipt_amt),
        claim_amt: formatNumber(payload2.claim_amt),
        staff_iou_amt: formatNumber(payload2.staff_iou_amt),
        close_balance_amt: formatNumber(payload2.close_balance_amt),
        cash_in_hand: formatNumber(payload2.cash_in_hand),
        
        // === COMMENTS (USER-EDITABLE) ===
        comments: formatString(payload2.comments),
        
        // === LINE COUNTS (AUTO-CALCULATED) ===
        line_count: formatNumber(payload2.line_count),
        receipt_count: formatNumber(payload2.receipt_count)
      });

      // =========================================================================
      // COMPARISON LOGIC
      // =========================================================================
      if (jsonProps1 === jsonProps2) {
        result = "Y"; // Payloads are identical
      } else {
        result = "N"; // Payloads have differences
      }

      // =========================================================================
      // DEBUG LOGGING (COMPREHENSIVE)
      // =========================================================================
      console.log("╔════════════════════════════════════════════════════════════════╗");
      console.log("║   PETTY CASH HEADER PAYLOAD COMPARISON (ALL FIELDS)            ║");
      console.log("╚════════════════════════════════════════════════════════════════╝");
      console.log("");
      console.log("📊 Payload 1 (Original):");
      console.log(jsonProps1);
      console.log("");
      console.log("📊 Payload 2 (Current):");
      console.log(jsonProps2);
      console.log("");
      console.log(`🔍 Comparison Result: ${result} ${result === "Y" ? "✅ (IDENTICAL)" : "❌ (DIFFERENT)"}`);
      
      // =========================================================================
      // DETAILED FIELD-BY-FIELD COMPARISON (For debugging)
      // =========================================================================
      if (result === "N") {
        console.log("");
        console.log("╔════════════════════════════════════════════════════════════════╗");
        console.log("║   DIFFERENCES DETECTED - FIELD-BY-FIELD ANALYSIS               ║");
        console.log("╚════════════════════════════════════════════════════════════════╝");
        
        const obj1 = JSON.parse(jsonProps1);
        const obj2 = JSON.parse(jsonProps2);
        
        let changeCount = 0;
        
        Object.keys(obj1).forEach(key => {
          if (obj1[key] !== obj2[key]) {
            changeCount++;
            console.log(`  ${changeCount}. ${key}:`);
            console.log(`     Old: "${obj1[key]}"`);
            console.log(`     New: "${obj2[key]}"`);
            
            // Special handling for amounts (show difference)
            if (key.includes('amt') || key.includes('balance') || key.includes('cash') || 
                key.includes('count')) {
              const diff = obj2[key] - obj1[key];
              console.log(`     Δ Change: ${diff >= 0 ? '+' : ''}${diff}`);
            }
            console.log("");
          }
        });
        
        console.log(`📊 Total Changes Detected: ${changeCount}`);
      } else {
        console.log("✅ No differences found - payloads are identical");
      }
      
      console.log("═══════════════════════════════════════════════════════════════");

      return result;
    }
  }
  
  return PageModule;
});