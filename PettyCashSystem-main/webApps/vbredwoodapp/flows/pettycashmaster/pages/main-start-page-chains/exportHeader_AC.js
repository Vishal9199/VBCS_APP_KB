// WORKING 1: Normal Export
// -----------------------------------------------------------
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

//   class exportExcelAC extends ActionChain {

//     /**
//      * Export all petty cash header records to Excel
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       try {
//         console.log("📊 Starting Excel export...");

//         // Show loading notification
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Preparing Excel export...',
//           displayMode: 'transient',
//           type: 'info'
//         });

//         // ✅ STEP 1: Fetch ALL records (no limit)
//         const exportSearchObj = {
//           ...$variables.SearchObj,
//           in_limit: '999999',  // Large number to get all records
//           in_offset: '0'       // Start from beginning
//         };

//         console.log("🔍 Fetching all records with filters:", exportSearchObj);

//         // Encrypt search payload
//         let encryptJs = await Actions.callChain(context, {
//           chain: 'application:encLargePayloadWithTime',
//           params: {
//             plainText: exportSearchObj,
//           },
//         });

//         const encSearchObj = { payload: encryptJs };

//         // Fetch all records
//         const response = await Actions.callRest(context, {
//           endpoint: 'ORDS/postPettycashHeaderSearch',
//           body: encSearchObj,
//         });

//         console.log("✅ Fetched records:", response.body.OUT_TOTAL_COUNT);

//         if (!response.body.P_OUTPUT || response.body.P_OUTPUT.length === 0) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'No records to export',
//             displayMode: 'transient',
//             type: 'warning'
//           });
//           return;
//         }

//         // ✅ STEP 2: Prepare data for Excel
//         const allRecords = response.body.P_OUTPUT;
        
//         // Define columns to export (customize as needed)
//         const excelData = allRecords.map(record => ({
//           'Claim Header ID': record.claim_header_id || '',
//           'Claim Number': record.claim_number || '',
//           'Request Date': this.formatDate(record.request_date),
//           'Claim Amount': record.claim_amt || 0,
//           'Cash in Hand': record.cash_in_hand || 0,
//           'Governorate': record.governorate || '',
//           'Petty Cash Type': record.petty_cash_type || '',
//           'Supplier Name': record.supplier_name || '',
//           'Supplier Number': record.supplier_number || '',
//           // 'Employee Name': record.employee_name || '',
//           // 'Employee Number': record.employee_number || '',
//           // 'Department': record.department || '',
//           'Status': record.status_name || '',
//           'Created By': record.created_by || '',
//           'Creation Date': this.formatDate(record.created_date),
//           'Last Updated By': record.last_updated_by || '',
//           'Last Update Date': this.formatDate(record.last_updated_date)
//         }));

//         console.log("📋 Prepared", excelData.length, "rows for export");

//         // ✅ STEP 3: Load XLSX library and create Excel workbook
//         console.log("📦 Loading XLSX library...");
        
//         // Load XLSX dynamically using RequireJS
//         const XLSX = await new Promise((resolve, reject) => {
//           requirejs(['xlsx'], function(xlsx) {
//             console.log("✅ XLSX library loaded successfully");
//             resolve(xlsx);
//           }, function(err) {
//             console.error("❌ Failed to load XLSX:", err);
//             reject(new Error('Failed to load XLSX library'));
//           });
//         });
        
//         // Create worksheet from data
//         const worksheet = XLSX.utils.json_to_sheet(excelData);

//         // Set column widths
//         worksheet['!cols'] = [
//           { wch: 15 }, // Claim Header ID
//           { wch: 20 }, // Claim Number
//           { wch: 15 }, // Request Date
//           { wch: 15 }, // Claim Amount
//           { wch: 15 }, // Cash in Hand
//           { wch: 20 }, // Governorate
//           { wch: 20 }, // Petty Cash Type
//           { wch: 30 }, // Supplier Name
//           { wch: 20 }, // Supplier Number
//           // { wch: 25 }, // Employee Name
//           // { wch: 20 }, // Employee Number
//           // { wch: 25 }, // Department
//           { wch: 15 }, // Status Name
//           { wch: 20 }, // Created By
//           { wch: 20 }, // Creation Date
//           { wch: 20 }, // Last Updated By
//           { wch: 20 }  // Last Updated Date
//         ];

//         // Create workbook
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Petty Cash Headers');

//         // ✅ STEP 4: Generate filename with timestamp
//         const now = new Date();
//         const timestamp = now.getFullYear() + 
//           String(now.getMonth() + 1).padStart(2, '0') +
//           String(now.getDate()).padStart(2, '0') + '_' +
//           String(now.getHours()).padStart(2, '0') +
//           String(now.getMinutes()).padStart(2, '0') +
//           String(now.getSeconds()).padStart(2, '0');
        
//         const filename = `Petty_Cash_Headers_${timestamp}.xlsx`;

//         console.log("💾 Generating file:", filename);

//         // ✅ STEP 5: Download the file
//         XLSX.writeFile(workbook, filename);

//         console.log("✅ Excel export completed successfully");

//         // Show success notification
//         await Actions.fireNotificationEvent(context, {
//           summary: `Successfully exported ${excelData.length} records to ${filename}`,
//           displayMode: 'transient',
//           type: 'confirmation'
//         });

//       } catch (error) {
//         console.error("❌ Export error:", error);
        
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Export failed: ' + error.message,
//           displayMode: 'transient',
//           type: 'error'
//         });
//       }
//     }

//     /**
//      * Format date for Excel display
//      * @param {string} dateString - ISO date string
//      * @returns {string} Formatted date (DD-MMM-YYYY)
//      */
//     formatDate(dateString) {
//       if (!dateString) return '';
      
//       try {
//         const date = new Date(dateString);
//         const day = String(date.getDate()).padStart(2, '0');
//         const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//         const month = months[date.getMonth()];
//         const year = date.getFullYear();
        
//         return `${day}-${month}-${year}`;
//       } catch (e) {
//         return dateString;
//       }
//     }
//   }

//   return exportExcelAC;
// });



// WORKING 2: Export with XLSX Free Version(No Colors)
// -----------------------------------------------------------
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

//   class exportExcelAC extends ActionChain {

//     /**
//      * Export all petty cash header records to Excel with professional styling
//      * @param {Object} context
//      */
//     async run(context) {
//       const { $page, $flow, $application, $constants, $variables } = context;

//       try {
//         console.log("📊 Starting Excel export with styling...");

//         // Show loading notification
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Preparing Excel export...',
//           displayMode: 'transient',
//           type: 'info'
//         });

//         // ✅ STEP 1: Fetch ALL records (no limit)
//         const exportSearchObj = {
//           ...$variables.SearchObj,
//           in_limit: '999999',
//           in_offset: '0'
//         };

//         console.log("🔍 Fetching all records with filters:", exportSearchObj);

//         // Encrypt search payload
//         let encryptJs = await Actions.callChain(context, {
//           chain: 'application:encLargePayloadWithTime',
//           params: {
//             plainText: exportSearchObj,
//           },
//         });

//         const encSearchObj = { payload: encryptJs };

//         // Fetch all records
//         const response = await Actions.callRest(context, {
//           endpoint: 'ORDS/postPettycashHeaderSearch',
//           body: encSearchObj,
//         });

//         console.log("✅ Fetched records:", response.body.OUT_TOTAL_COUNT);

//         if (!response.body.P_OUTPUT || response.body.P_OUTPUT.length === 0) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'No records to export',
//             displayMode: 'transient',
//             type: 'warning'
//           });
//           return;
//         }

//         // ✅ STEP 2: Prepare data for Excel
//         const allRecords = response.body.P_OUTPUT;
        
//         // Define columns to export
//         const excelData = allRecords.map(record => ({
//           'Claim Header ID': record.claim_header_id || '',
//           'Claim Number': record.claim_number || '',
//           'Request Date': this.formatDate(record.request_date),
//           'Claim Amount': record.claim_amt || 0,
//           'Cash in Hand': record.cash_in_hand || 0,
//           'Governorate': record.governorate || '',
//           'Petty Cash Type': record.petty_cash_type || '',
//           'Supplier Name': record.supplier_name || '',
//           'Supplier Number': record.supplier_number || '',
//           'Status': record.status_name || '',
//           'Created By': record.created_by || '',
//           'Creation Date': this.formatDate(record.created_date),
//           'Last Updated By': record.last_updated_by || '',
//           'Last Update Date': this.formatDate(record.last_updated_date)
//         }));

//         console.log("📋 Prepared", excelData.length, "rows for export");

//         // Calculate totals for summary
//         const totalClaimAmount = allRecords.reduce((sum, r) => sum + (r.claim_amt || 0), 0);
//         const totalCashInHand = allRecords.reduce((sum, r) => sum + (r.cash_in_hand || 0), 0);

//         // ✅ STEP 3: Load XLSX library
//         console.log("📦 Loading XLSX library...");
        
//         const XLSX = await new Promise((resolve, reject) => {
//           requirejs(['xlsx'], function(xlsx) {
//             console.log("✅ XLSX library loaded successfully");
//             resolve(xlsx);
//           }, function(err) {
//             console.error("❌ Failed to load XLSX:", err);
//             reject(new Error('Failed to load XLSX library'));
//           });
//         });

//         // ✅ STEP 4: Create styled worksheet
//         console.log("🎨 Creating styled Excel worksheet...");
        
//         // Create worksheet from data
//         const worksheet = XLSX.utils.json_to_sheet(excelData);

//         // Get the range of the worksheet
//         const range = XLSX.utils.decode_range(worksheet['!ref']);

//         // ✅ FEATURE 1: Style Header Row (Row 1)
//         console.log("🎨 Applying header styling...");
//         for (let col = range.s.c; col <= range.e.c; col++) {
//           const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
//           if (!worksheet[cellAddress]) continue;
          
//           // Apply header styling
//           worksheet[cellAddress].s = {
//             font: { 
//               bold: true, 
//               color: { rgb: "FFFFFF" },
//               sz: 12,
//               name: "Calibri"
//             },
//             fill: { 
//               fgColor: { rgb: "0070C0" }  // Professional blue
//             },
//             alignment: { 
//               horizontal: "center", 
//               vertical: "center",
//               wrapText: false
//             },
//             border: {
//               top: { style: "thin", color: { rgb: "000000" } },
//               bottom: { style: "thin", color: { rgb: "000000" } },
//               left: { style: "thin", color: { rgb: "000000" } },
//               right: { style: "thin", color: { rgb: "000000" } }
//             }
//           };
//         }

//         // ✅ FEATURE 2: Auto-size columns based on content
//         console.log("📏 Calculating dynamic column widths...");
//         const columnWidths = this.calculateColumnWidths(excelData);
//         worksheet['!cols'] = columnWidths;

//         // ✅ FEATURE 3: Apply alternating row colors (zebra striping)
//         console.log("🦓 Applying zebra striping...");
//         for (let row = range.s.r + 1; row <= range.e.r; row++) {
//           const isEvenRow = (row % 2 === 0);
          
//           for (let col = range.s.c; col <= range.e.c; col++) {
//             const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
//             if (!worksheet[cellAddress]) continue;
            
//             // Apply cell styling
//             worksheet[cellAddress].s = {
//               font: { 
//                 name: "Calibri",
//                 sz: 11
//               },
//               fill: { 
//                 fgColor: { rgb: isEvenRow ? "F2F2F2" : "FFFFFF" }
//               },
//               alignment: { 
//                 horizontal: this.getColumnAlignment(col),
//                 vertical: "center"
//               },
//               border: {
//                 top: { style: "thin", color: { rgb: "D3D3D3" } },
//                 bottom: { style: "thin", color: { rgb: "D3D3D3" } },
//                 left: { style: "thin", color: { rgb: "D3D3D3" } },
//                 right: { style: "thin", color: { rgb: "D3D3D3" } }
//               }
//             };

//             // Apply number formatting for amount columns
//             if (col === 3 || col === 4) { // Claim Amount, Cash in Hand
//               worksheet[cellAddress].z = '#,##0.00';
//             }
//           }
//         }

//         // ✅ FEATURE 4: Add Summary Row
//         console.log("📊 Adding summary row...");
//         const summaryRow = range.e.r + 2; // Leave one blank row
        
//         // Summary label
//         worksheet[XLSX.utils.encode_cell({ r: summaryRow, c: 0 })] = {
//           v: "TOTAL",
//           t: "s",
//           s: {
//             font: { bold: true, sz: 12, name: "Calibri" },
//             fill: { fgColor: { rgb: "FFC000" } },
//             alignment: { horizontal: "right", vertical: "center" },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "medium", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           }
//         };

//         // Total Claim Amount
//         worksheet[XLSX.utils.encode_cell({ r: summaryRow, c: 3 })] = {
//           v: totalClaimAmount,
//           t: "n",
//           z: '#,##0.00',
//           s: {
//             font: { bold: true, sz: 12, name: "Calibri" },
//             fill: { fgColor: { rgb: "FFC000" } },
//             alignment: { horizontal: "right", vertical: "center" },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "medium", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           }
//         };

//         // Total Cash in Hand
//         worksheet[XLSX.utils.encode_cell({ r: summaryRow, c: 4 })] = {
//           v: totalCashInHand,
//           t: "n",
//           z: '#,##0.00',
//           s: {
//             font: { bold: true, sz: 12, name: "Calibri" },
//             fill: { fgColor: { rgb: "FFC000" } },
//             alignment: { horizontal: "right", vertical: "center" },
//             border: {
//               top: { style: "medium", color: { rgb: "000000" } },
//               bottom: { style: "medium", color: { rgb: "000000" } },
//               left: { style: "medium", color: { rgb: "000000" } },
//               right: { style: "medium", color: { rgb: "000000" } }
//             }
//           }
//         };

//         // Update worksheet range to include summary row
//         worksheet['!ref'] = XLSX.utils.encode_range({
//           s: { c: range.s.c, r: range.s.r },
//           e: { c: range.e.c, r: summaryRow }
//         });

//         // ✅ FEATURE 5: Freeze header row
//         console.log("❄️ Freezing header row...");
//         worksheet['!freeze'] = { 
//           xSplit: 0, 
//           ySplit: 1,  // Freeze first row
//           topLeftCell: 'A2',
//           activePane: 'bottomLeft',
//           state: 'frozen'
//         };

//         // ✅ FEATURE 6: Add auto-filter
//         console.log("🔍 Adding auto-filter...");
//         worksheet['!autofilter'] = { 
//           ref: XLSX.utils.encode_range({
//             s: { c: range.s.c, r: range.s.r },
//             e: { c: range.e.c, r: range.s.r }
//           })
//         };

//         // ✅ FEATURE 7: Set print options
//         console.log("🖨️ Configuring print settings...");
//         worksheet['!margins'] = {
//           left: 0.7,
//           right: 0.7,
//           top: 0.75,
//           bottom: 0.75,
//           header: 0.3,
//           footer: 0.3
//         };

//         worksheet['!printOptions'] = {
//           horizontalCentered: true,
//           verticalCentered: false
//         };

//         // Set print area
//         worksheet['!printArea'] = XLSX.utils.encode_range({
//           s: { c: range.s.c, r: range.s.r },
//           e: { c: range.e.c, r: summaryRow }
//         });

//         // Fit to one page width
//         worksheet['!pageSetup'] = {
//           paperSize: 9, // A4
//           orientation: 'landscape',
//           scale: 100,
//           fitToWidth: 1,
//           fitToHeight: 0,
//           fitToPage: true
//         };

//         // ✅ STEP 5: Create workbook
//         console.log("📚 Creating workbook...");
//         const workbook = XLSX.utils.book_new();
        
//         // Set workbook properties
//         workbook.Props = {
//           Title: "Petty Cash Headers Export",
//           Subject: "Petty Cash Management",
//           Author: "VBCS Application",
//           CreatedDate: new Date()
//         };

//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Petty Cash Headers');

//         // ✅ STEP 6: Generate filename with timestamp
//         const now = new Date();
//         const timestamp = now.getFullYear() + 
//           String(now.getMonth() + 1).padStart(2, '0') +
//           String(now.getDate()).padStart(2, '0') + '_' +
//           String(now.getHours()).padStart(2, '0') +
//           String(now.getMinutes()).padStart(2, '0') +
//           String(now.getSeconds()).padStart(2, '0');
        
//         const filename = `Petty_Cash_Headers_${timestamp}.xlsx`;

//         console.log("💾 Generating styled file:", filename);

//         // ✅ STEP 7: Download the file
//         XLSX.writeFile(workbook, filename);

//         console.log("✅ Styled Excel export completed successfully");

//         // Show success notification with details
//         await Actions.fireNotificationEvent(context, {
//           summary: `Successfully exported ${excelData.length} records with professional styling`,
//           message: `File: ${filename}\nTotal Claim Amount: ${totalClaimAmount.toLocaleString()}\nTotal Cash in Hand: ${totalCashInHand.toLocaleString()}`,
//           displayMode: 'transient',
//           type: 'confirmation'
//         });

//       } catch (error) {
//         console.error("❌ Export error:", error);
        
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Export failed: ' + error.message,
//           displayMode: 'transient',
//           type: 'error'
//         });
//       }
//     }

//     /**
//      * Calculate dynamic column widths based on content
    //  
//      * @returns {Array} Column width configuration
//      */
//     calculateColumnWidths(data) {
//       if (!data || data.length === 0) return [];

//       const columnWidths = [];
//       const headers = Object.keys(data[0]);

//       headers.forEach((header, colIndex) => {
//         // Start with header length
//         let maxWidth = header.length;

//         // Check all data rows
//         data.forEach(row => {
//           const cellValue = String(row[header] || '');
//           maxWidth = Math.max(maxWidth, cellValue.length);
//         });

//         // Add padding and set min/max limits
//         const calculatedWidth = Math.min(Math.max(maxWidth + 2, 10), 50);
        
//         columnWidths.push({ wch: calculatedWidth });
//       });

//       return columnWidths;
//     }

//     /**
//      * Get column alignment based on column index
//      * @param {number} colIndex - Column index
//      * @returns {string} Alignment type
//      */
//     getColumnAlignment(colIndex) {
//       // Column 0: Claim Header ID - center
//       // Column 3: Claim Amount - right
//       // Column 4: Cash in Hand - right
//       // Others: left
      
//       if (colIndex === 0) return 'center';
//       if (colIndex === 3 || colIndex === 4) return 'right';
//       return 'left';
//     }

//     /**
//      * Format date for Excel display
//      * @param {string} dateString - ISO date string
//      * @returns {string} Formatted date (DD-MMM-YYYY)
//      */
//     formatDate(dateString) {
//       if (!dateString) return '';
      
//       try {
//         const date = new Date(dateString);
//         const day = String(date.getDate()).padStart(2, '0');
//         const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//         const month = months[date.getMonth()];
//         const year = date.getFullYear();
        
//         return `${day}-${month}-${year}`;
//       } catch (e) {
//         return dateString;
//       }
//     }
//   }

//   return exportExcelAC;
// });



// WORKING 3: Export with ExcelJs(With Colors)
// -----------------------------------------------------------
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

  class exportExcelAC extends ActionChain {

    /**
     * Export all petty cash header records to Excel with professional styling
     * Uses dynamic script loading for ExcelJS CDN
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("📊 Starting Excel export with ExcelJS styling...");

        // Show loading notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Preparing Excel export...',
          displayMode: 'transient',
          type: 'info'
        });

        // ✅ STEP 1: Fetch ALL records
        const exportSearchObj = {
          ...$variables.SearchObj,
          in_limit: '999999',
          in_offset: '0'
        };

        console.log("🔍 Fetching all records with filters:", exportSearchObj);

        // Encrypt search payload
        let encryptJs = await Actions.callChain(context, {
          chain: 'application:encLargePayloadWithTime',
          params: {
            plainText: exportSearchObj,
          },
        });

        const encSearchObj = { payload: encryptJs };

        // Fetch all records
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postPettycashHeaderSearch',
          body: encSearchObj,
        });

        console.log("✅ Fetched records:", response.body.OUT_TOTAL_COUNT);

        if (!response.body.P_OUTPUT || response.body.P_OUTPUT.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No records to export',
            displayMode: 'transient',
            type: 'warning'
          });
          return;
        }

        const allRecords = response.body.P_OUTPUT;

        // ✅ STEP 2: Load ExcelJS library dynamically from CDN
        console.log("📦 Loading ExcelJS library from CDN...");
        
        const ExcelJS = await this.loadExcelJS();
        
        if (!ExcelJS) {
          throw new Error('Failed to load ExcelJS library from CDN');
        }

        console.log("✅ ExcelJS library loaded successfully");

        // ✅ STEP 3: Create workbook and worksheet
        console.log("📚 Creating workbook...");
        const workbook = new ExcelJS.Workbook();
        
        // Set workbook properties
        workbook.creator = 'VBCS Application';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        const worksheet = workbook.addWorksheet('Petty Cash', {
          pageSetup: {
            paperSize: 9, // A4
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0
          }
        });

        // ✅ STEP 4: Define columns
        console.log("📋 Configuring columns...");
        worksheet.columns = [
  {
    header: 'S.No',
    key: 'serial_number',
    width: 10,
  },
  {
    header: 'Reference Number',
    key: 'claim_number',
    width: 25,
  },
  {
    header: 'Governorate',
    key: 'governorate',
    width: 30,
  },
  {
    header: 'Supplier Name',
    key: 'supplier_name',
    width: 35,
  },
  {
    header: 'Supplier Number',
    key: 'supplier_number',
    width: 20,
  },
  {
    header: 'Request Date',
    key: 'request_date',
    width: 18,
  },
  {
    header: 'Claim Amount',
    key: 'claim_amt',
    width: 18,
  },
  {
    header: 'Cash in Hand',
    key: 'cash_in_hand',
    width: 18,
  },
  {
    header: 'Status',
    key: 'status_name',
    width: 20,
  },
  {
    header: 'Created By',
    key: 'created_by',
    width: 20,
  },
  {
    header: 'Creation Date',
    key: 'created_date',
    width: 18,
  },
  {
    header: 'Last Updated By',
    key: 'last_updated_by',
    width: 20,
  },
  {
    header: 'Last Update Date',
    key: 'last_updated_date',
    width: 18,
  },
];

        // ✅ STEP 5: Style header row
        console.log("🎨 Styling header row...");
        const headerRow = worksheet.getRow(1);
        
        headerRow.font = {
          name: 'Calibri',
          size: 12,
          bold: true,
          color: { argb: 'FFFFFFFF' } // White text
        };
        
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          // fgColor: { argb: '0BB084' } // background color
          fgColor: { argb: 'FF01474d' } // Custom color #01474d

        };
        
        headerRow.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: false
        };
        
        headerRow.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        
        headerRow.height = 25;

        // ✅ STEP 6: Add data rows with styling
        console.log("📊 Adding styled data rows...");
        let totalClaimAmount = 0;
        let totalCashInHand = 0;

        allRecords.forEach((record, index) => {
          const row = worksheet.addRow({
            // claim_header_id: record.claim_header_id || '',
            serial_number: index + 1, // Serial number starting from 1
            claim_number: record.claim_number || '',
            governorate: record.governorate || '',
            supplier_name: record.supplier_name || '',
            supplier_number: record.supplier_number || '',
            request_date: this.formatDate(record.request_date),
            claim_amt: record.claim_amt || 0,
            cash_in_hand: record.cash_in_hand || 0,
            // petty_cash_type: record.petty_cash_type || '',
            status_name: record.status_name || '',
            created_by: record.created_by || '',
            created_date: this.formatDate(record.created_date),
            last_updated_by: record.last_updated_by || '',
            last_updated_date: this.formatDate(record.last_updated_date)
          });

          // Calculate totals
          totalClaimAmount += (record.claim_amt || 0);
          totalCashInHand += (record.cash_in_hand || 0);

          // Zebra striping
          const isEvenRow = (index % 2 === 0);
          
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEvenRow ? 'FFF2F2F2' : 'FFFFFFFF' }
          };

          row.font = { name: 'Calibri', size: 11 };
          row.alignment = { vertical: 'middle', horizontal: 'left' };

          // Center align ID column
          row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
          // row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
          // row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
          // row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
          
          // Right align amount columns
          row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
          row.getCell(5).numFmt = '#,##0.000';
          row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' };
          row.getCell(7).numFmt = '#,##0.000';
          row.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' };
          row.getCell(8).numFmt = '#,##0.000';

          // Borders
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
            };
          });
        });

        console.log("📋 Added", allRecords.length, "styled rows");

        // ✅ STEP 7: Add summary row
        console.log("📊 Adding summary row...");
        
        worksheet.addRow([]);
        
        const summaryRow = worksheet.addRow([
          'TOTAL', '', '', totalClaimAmount, totalCashInHand, '', '', '', '', '', '', '', '', ''
        ]);

        summaryRow.font = {
          name: 'Calibri',
          size: 12,
          bold: true,
          color: { argb: 'FF000000' }
        };

        summaryRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC000' } // Yellow background
        };

        summaryRow.alignment = { vertical: 'middle', horizontal: 'right' };

        summaryRow.getCell(4).numFmt = '#,##0.00';
        summaryRow.getCell(5).numFmt = '#,##0.00';

        summaryRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'medium', color: { argb: 'FF000000' } },
            left: { style: 'medium', color: { argb: 'FF000000' } },
            bottom: { style: 'medium', color: { argb: 'FF000000' } },
            right: { style: 'medium', color: { argb: 'FF000000' } }
          };
        });

        // ✅ STEP 8: Add auto-filter and freeze panes
        console.log("🔍 Adding auto-filter and freeze panes...");
        worksheet.autoFilter = { from: 'A1', to: 'N1' };
        worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

        // ✅ STEP 9: Generate and download file
        // const now = new Date();
        // const timestamp = now.getFullYear() + 
          // String(now.getMonth() + 1).padStart(2, '0') +
          // String(now.getDate()).padStart(2, '0') + '_' +
          // String(now.getHours()).padStart(2, '0') +
          // String(now.getMinutes()).padStart(2, '0') +
          // String(now.getSeconds()).padStart(2, '0');
        
        // const filename = `Petty_Cash_Headers_${timestamp}.xlsx`;
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        const filename = `PettyCash_${day}_${month}_${year}.xlsx`;

        console.log("💾 Generating styled file:", filename);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log("✅ Styled Excel export completed successfully");

        await Actions.fireNotificationEvent(context, {
          summary: `Successfully exported ${allRecords.length} records`,
          displayMode: 'transient',
          type: 'confirmation',
        });

      } catch (error) {
        console.error("❌ Export error:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Export failed: ' + error.message,
          displayMode: 'transient',
          type: 'error'
        });
      }
    }

    /**
     * Dynamically load ExcelJS library from CDN
     * @returns {Promise} ExcelJS module
     */
    async loadExcelJS() {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.ExcelJS) {
          console.log("✅ ExcelJS already loaded");
          resolve(window.ExcelJS);
          return;
        }

        console.log("⬇️ Downloading ExcelJS from CDN...");

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
        script.type = 'text/javascript';
        
        script.onload = () => {
          console.log("✅ ExcelJS script loaded");
          
          // Wait a moment for library to initialize
          setTimeout(() => {
            if (window.ExcelJS) {
              resolve(window.ExcelJS);
            } else {
              reject(new Error('ExcelJS loaded but not available in window object'));
            }
          }, 100);
        };
        
        script.onerror = (error) => {
          console.error("❌ Failed to load ExcelJS script:", error);
          reject(new Error('Failed to load ExcelJS from CDN. Check network connection.'));
        };
        
        document.head.appendChild(script);
      });
    }

    /**
     * Format date for Excel display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date (DD-MMM-YYYY)
     */
    formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
      } catch (e) {
        return dateString;
      }
    }
  }

  return exportExcelAC;
});