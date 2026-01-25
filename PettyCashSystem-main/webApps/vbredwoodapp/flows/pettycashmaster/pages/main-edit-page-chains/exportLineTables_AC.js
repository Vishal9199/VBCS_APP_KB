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

  class unifiedTableExportAC extends ActionChain {

    /**
     * Unified export for both Claim Lines and Receipt Lines
     * Detects active tab and exports appropriate table with correct columns
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        // ✅ STEP 1: Detect active tab
        const selectedTab = $variables.selectedTab;
        
        console.log("📊 Unified Export - Active Tab:", selectedTab);

        // Determine which table to export
        let allRecords = [];
        let exportType = '';
        let sheetName = '';
        let filenamePrefix = '';

        if (selectedTab === 'claimLine') {
          // CRITICAL: Update this variable name to match YOUR page configuration
          allRecords = $variables.claimLineADP.data || [];
          exportType = 'CLAIM';
          sheetName = 'Claim Lines';
          filenamePrefix = 'ClaimExport';
          console.log("📋 Exporting Claim Lines...");
        } else if (selectedTab === 'receiptLine') {
          // CRITICAL: Update this variable name to match YOUR page configuration
          allRecords = $variables.receiptLineADP.data || [];
          exportType = 'RECEIPT';
          sheetName = 'Claim Receipt';
          filenamePrefix = 'ReceiptExport';
          console.log("🧾 Exporting Receipt Lines...");
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Please select a tab to export',
            displayMode: 'transient',
            type: 'warning'
          });
          return;
        }

        // Show loading notification
        await Actions.fireNotificationEvent(context, {
          summary: `Preparing ${sheetName} export...`,
          displayMode: 'transient',
          type: 'info'
        });

        console.log("✅ Fetched records:", allRecords.length);

        if (!allRecords || allRecords.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: `No ${sheetName.toLowerCase()} to export`,
            displayMode: 'transient',
            type: 'warning'
          });
          return;
        }

        // ✅ STEP 2: Load ExcelJS library
        console.log("📦 Loading ExcelJS library from CDN...");
        
        const ExcelJS = await this.loadExcelJS();
        
        if (!ExcelJS) {
          throw new Error('Failed to load ExcelJS library from CDN');
        }

        console.log("✅ ExcelJS library loaded successfully");

        // ✅ STEP 3: Create workbook and worksheet
        console.log("📚 Creating workbook...");
        const workbook = new ExcelJS.Workbook();
        
        workbook.creator = 'VBCS Application';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        const worksheet = workbook.addWorksheet(sheetName, {
          pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0
          }
        });

        // ✅ STEP 4: Define columns based on export type
        console.log("📋 Configuring columns for", exportType, "export...");
        
        if (exportType === 'CLAIM') {
          // Claim Lines columns (28 columns)
          worksheet.columns = [
            { header: 'S. No.', key: 'serial_no', width: 15 },
            // { header: 'Claim Header ID', key: 'claim_header_id', width: 18 },
            { header: 'Line Number', key: 'line_number', width: 12 },
            { header: 'Claim Number', key: 'claim_number', width: 25 },
            { header: 'Request Date', key: 'request_date', width: 18 },
            { header: 'Supplier Name', key: 'supplier_name', width: 35 },
            { header: 'Status', key: 'header_status_name', width: 18 },
            { header: 'Governorate Segment', key: 'governorate_segment', width: 20 },
            { header: 'Geography Segment', key: 'geography_segment', width: 20 },
            { header: 'Business Activities', key: 'business_activities_segment', width: 20 },
            { header: 'Cost Center', key: 'cost_center_segment', width: 15 },
            { header: 'Accounts Segment', key: 'accounts_segment', width: 18 },
            { header: 'Assets Segment', key: 'assets_segment', width: 18 },
            { header: 'Inter Company', key: 'inter_company_segment', width: 15 },
            { header: 'Future1 Segment', key: 'future1_segment', width: 15 },
            { header: 'Charge Account', key: 'charge_account', width: 40 },
            { header: 'Currency', key: 'currency', width: 12 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Exchange Rate Type', key: 'exchange_rate_type', width: 20 },
            { header: 'Exchange Rate Date', key: 'exchange_rate_date', width: 18 },
            { header: 'Exchange Rate', key: 'exchange_rate', width: 15 },
            { header: 'Line Amount', key: 'line_amount', width: 18 },
            { header: 'Brief Narration', key: 'brief_narration', width: 30 },
            { header: 'Budget Status', key: 'budget_status', width: 15 },
            { header: 'Created By', key: 'created_by', width: 25 },
            { header: 'Creation Date', key: 'created_date', width: 18 },
            { header: 'Last Updated By', key: 'last_updated_by', width: 25 },
            { header: 'Last Update Date', key: 'last_updated_date', width: 18 }
          ];
        } else {
          // Receipt Lines columns (20 columns)
          worksheet.columns = [
            { header: 'S. No.', key: 'serial_no', width: 15 },
            // { header: 'Claim Header ID', key: 'claim_header_id', width: 18 },
            { header: 'Claim Number', key: 'claim_number', width: 25 },
            { header: 'Request Date', key: 'request_date', width: 18 },
            { header: 'Supplier Name', key: 'supplier_name', width: 35 },
            { header: 'Status', key: 'header_status_name', width: 18 },
            { header: 'Mode of Payment', key: 'mode_of_payment', width: 20 },
            { header: 'Payment Received Date', key: 'payment_received_date', width: 22 },
            { header: 'Reference Number', key: 'reference_number', width: 20 },
            { header: 'Currency', key: 'currency', width: 12 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Exchange Rate Type', key: 'exchange_rate_type', width: 20 },
            { header: 'Exchange Rate Date', key: 'exchange_rate_date', width: 18 },
            { header: 'Exchange Rate', key: 'exchange_rate', width: 15 },
            { header: 'Receipt Line Amount', key: 'receipt_line_amount', width: 20 },
            { header: 'Brief Narration', key: 'brief_narration', width: 40 },
            { header: 'Created By', key: 'created_by', width: 25 },
            { header: 'Creation Date', key: 'created_date', width: 18 },
            { header: 'Last Updated By', key: 'last_updated_by', width: 25 },
            { header: 'Last Update Date', key: 'last_updated_date', width: 18 }
          ];
        }

        // ✅ STEP 5: Style header row
        console.log("🎨 Styling header row...");
        const headerRow = worksheet.getRow(1);
        
        headerRow.font = {
          name: 'Calibri',
          size: 12,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF01474d' }
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
        let totalAmount = 0;
        let totalLineAmount = 0;

        allRecords.forEach((record, index) => {
          let rowData = {};
          
          if (exportType === 'CLAIM') {
            // Claim Lines data mapping
            rowData = {
              serial_no: index + 1,
              // claim_header_id: record.claim_header_id || '',
              line_number: record.line_number || '',
              claim_number: record.claim_number || '',
              request_date: this.formatDate(record.request_date),
              supplier_name: record.supplier_name || '',
              header_status_name: record.header_status_name || '',
              governorate_segment: record.governorate_segment || '',
              geography_segment: record.geography_segment || '',
              business_activities_segment: record.business_activities_segment || '',
              cost_center_segment: record.cost_center_segment || '',
              accounts_segment: record.accounts_segment || '',
              assets_segment: record.assets_segment || '',
              inter_company_segment: record.inter_company_segment || '',
              future1_segment: record.future1_segment || '',
              charge_account: record.charge_account || '',
              currency: record.currency || '',
              amount: record.amount || 0,
              exchange_rate_type: record.exchange_rate_type || '',
              exchange_rate_date: this.formatDate(record.exchange_rate_date),
              exchange_rate: record.exchange_rate || 0,
              line_amount: record.line_amount || 0,
              brief_narration: record.brief_narration || '',
              budget_status: record.budget_status || '',
              created_by: record.created_by || '',
              created_date: this.formatDate(record.created_date),
              last_updated_by: record.last_updated_by || '',
              last_updated_date: this.formatDate(record.last_updated_date)
            };
            
            totalAmount += (record.amount || 0);
            totalLineAmount += (record.line_amount || 0);
            
          } else {
            // Receipt Lines data mapping
            rowData = {
              serial_no: index + 1,
              // claim_header_id: record.claim_header_id || '',
              claim_number: record.claim_number || '',
              request_date: this.formatDate(record.request_date),
              supplier_name: record.supplier_name || '',
              header_status_name: record.header_status_name || '',
              mode_of_payment: record.mode_of_payment || '',
              payment_received_date: this.formatDate(record.payment_received_date),
              reference_number: record.reference_number || '',
              currency: record.currency || '',
              amount: record.amount || 0,
              exchange_rate_type: record.exchange_rate_type || '',
              exchange_rate_date: this.formatDate(record.exchange_rate_date),
              exchange_rate: record.exchange_rate || 0,
              receipt_line_amount: record.receipt_line_amount || 0,
              brief_narration: record.brief_narration || '',
              created_by: record.created_by || '',
              created_date: this.formatDate(record.created_date),
              last_updated_by: record.last_updated_by || '',
              last_updated_date: this.formatDate(record.last_updated_date)
            };
            
            totalAmount += (record.amount || 0);
            totalLineAmount += (record.receipt_line_amount || 0);
          }
          
          const row = worksheet.addRow(rowData);

          // Zebra striping
          const isEvenRow = (index % 2 === 0);
          
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEvenRow ? 'FFF2F2F2' : 'FFFFFFFF' }
          };

          row.font = { name: 'Calibri', size: 11 };
          row.alignment = { vertical: 'middle', horizontal: 'left' };

          // Center align ID columns
          row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
          row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
          if (exportType === 'CLAIM') {
            row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
          }
          
          // Right align amount columns with number format
          if (exportType === 'CLAIM') {
            // Amount column (17)
            row.getCell(17).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(17).numFmt = '#,##0.000';
            
            // Exchange Rate column (20)
            row.getCell(20).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(20).numFmt = '#,##0.000';
            
            // Line Amount column (22)
            row.getCell(21).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(21).numFmt = '#,##0.000';
          } else {
            // Amount column (11)
            row.getCell(10).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(10).numFmt = '#,##0.000';
            
            // Exchange Rate column (14)
            row.getCell(13).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(13).numFmt = '#,##0.000';
            
            // Receipt Line Amount column (15)
            row.getCell(14).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(14).numFmt = '#,##0.000';
          }

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
        
        let summaryRow;
        if (exportType === 'CLAIM') {
          // Create array with 28 empty cells, then set specific values
          const summaryData = new Array(27).fill('');
          summaryData[0] = 'TOTAL';
          summaryData[16] = totalAmount;  // Amount column (18th position, index 17)
          summaryData[20] = totalLineAmount;  // Line Amount column (22nd position, index 21)
          summaryRow = worksheet.addRow(summaryData);
          
          summaryRow.getCell(17).numFmt = '#,##0.000';
          summaryRow.getCell(21).numFmt = '#,##0.000';
        } else {
          // Create array with 20 empty cells, then set specific values
          const summaryData = new Array(20).fill('');
          summaryData[0] = 'TOTAL';
          summaryData[9] = totalAmount;  // Amount column (11th position, index 10)
          summaryData[13] = totalLineAmount;  // Receipt Line Amount column (15th position, index 14)
          summaryRow = worksheet.addRow(summaryData);
          
          summaryRow.getCell(11).numFmt = '#,##0.000';
          summaryRow.getCell(15).numFmt = '#,##0.000';
        }

        summaryRow.font = {
          name: 'Calibri',
          size: 12,
          bold: true,
          color: { argb: 'FF000000' }
        };

        summaryRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC000' }
        };

        summaryRow.alignment = { vertical: 'middle', horizontal: 'right' };

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
        const lastColumn = exportType === 'CLAIM' ? 'AB' : 'T';
        worksheet.autoFilter = { from: 'A1', to: `${lastColumn}1` };
        worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

        // ✅ STEP 9: Generate and download file
        // const now = new Date();
        // const timestamp = now.getFullYear() + 
        //   String(now.getMonth() + 1).padStart(2, '0') +
        //   String(now.getDate()).padStart(2, '0') + '_' +
        //   String(now.getHours()).padStart(2, '0') +
        //   String(now.getMinutes()).padStart(2, '0') +
        //   String(now.getSeconds()).padStart(2, '0');
        
        // const filename = `${filenamePrefix}_${timestamp}.xlsx`;

        // console.log("💾 Generating styled file:", filename);

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');

        const months = [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ];
        const month = months[now.getMonth()];
        const year = now.getFullYear();

        const filename = `${filenamePrefix}_${day}_${month}_${year}.xlsx`;
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

        const amountLabel = exportType === 'CLAIM' ? 'Line Amount' : 'Receipt Amount';
        
        await Actions.fireNotificationEvent(context, {
          summary: `Successfully exported ${allRecords.length} ${sheetName.toLowerCase()}`,
          // message: `Total Amount: ${totalAmount.toLocaleString()} | Total ${amountLabel}: ${totalLineAmount.toLocaleString()}`,
          displayMode: 'transient',
          type: 'confirmation'
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
     */
    async loadExcelJS() {
      return new Promise((resolve, reject) => {
        if (window.ExcelJS) {
          console.log("✅ ExcelJS already loaded");
          resolve(window.ExcelJS);
          return;
        }

        console.log("⬇️ Downloading ExcelJS from CDN...");

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
        script.type = 'text/javascript';
        
        script.onload = () => {
          console.log("✅ ExcelJS script loaded");
          
          setTimeout(() => {
            if (window.ExcelJS) {
              resolve(window.ExcelJS);
            } else {
              reject(new Error('ExcelJS loaded but not available'));
            }
          }, 100);
        };
        
        script.onerror = (error) => {
          console.error("❌ Failed to load ExcelJS script:", error);
          reject(new Error('Failed to load ExcelJS from CDN'));
        };
        
        document.head.appendChild(script);
      });
    }

    /**
     * Format date for Excel display
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

  return unifiedTableExportAC;
});