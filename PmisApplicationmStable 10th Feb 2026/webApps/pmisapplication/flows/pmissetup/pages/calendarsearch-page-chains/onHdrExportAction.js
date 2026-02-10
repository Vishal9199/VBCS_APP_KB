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

  class onHdrExportAction extends ActionChain {

    /**
     * Export all calendar header records to Excel with professional styling
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

        // ✅ STEP 1: DIAGNOSTIC - Check what's in searchObj
        console.log("🔍 DIAGNOSTIC - Original searchObj:", JSON.stringify($variables.searchObj, null, 2));
        
        // ✅ CRITICAL FIX: Use exact same pattern as working Tender Strategy code
        const exportSearchObj = {
          ...$variables.searchObj,
          in_limit: '999999',
          in_offset: '0',
        };
        
        console.log("🔍 DIAGNOSTIC - Export searchObj:", JSON.stringify(exportSearchObj, null, 2));

        // Encrypt search payload
        let encryptJs = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: exportSearchObj,
          },
        });

        // ✅ Validate encryption result
        if (!encryptJs) {
          throw new Error('Encryption failed - no encrypted payload returned');
        }

        const encSearchObj = { payload: encryptJs };
        console.log("Sending this payload for getting all records: ", encSearchObj);


        // Fetch all records
        const response = await Actions.callRest(context, {
          endpoint: 'PmisSetup/postPmisCalendarSearch',
          body: encSearchObj,
        });

        // ✅ Validate response structure with detailed logging
        if (!response || !response.body) {
          throw new Error('Failed to fetch data - empty response from server');
        }

        console.log("📦 API Response Structure:", {
          status: response.body.OUT_STATUS,
          description: response.body.OUT_DESCRIPTION,
          count: response.body.OUT_COUNT,
          totalCount: response.body.OUT_TOTAL_COUNT,
          hasNext: response.body.OUT_HAS_NEXT,
          recordsPresent: !!response.body.P_OUTPUT
        });

        // ✅ Extract data from P_OUTPUT with validation
        const allRecords = response.body.P_OUTPUT || [];
        const totalCount = response.body.OUT_TOTAL_COUNT || 0;
        const fetchedCount = response.body.OUT_COUNT || 0;
        const hasNext = response.body.OUT_HAS_NEXT;
        const apiStatus = response.body.OUT_STATUS;

        // ✅ CRITICAL: Check if we got all records
        console.log(`📊 Record Count Analysis:`);
        console.log(`   - Total Available: ${totalCount}`);
        console.log(`   - Fetched This Call: ${fetchedCount}`);
        console.log(`   - Array Length: ${allRecords.length}`);
        console.log(`   - Has More Pages: ${hasNext}`);

        // ✅ Check if API call was successful
        if (apiStatus !== 'SUCCESS') {
          throw new Error(`API returned status: ${apiStatus} - ${response.body.OUT_DESCRIPTION || 'Unknown error'}`);
        }

        // ✅ CRITICAL: Warn if not all records fetched
        if (allRecords.length < totalCount || hasNext === 'Y') {
          console.warn(`⚠️ WARNING: Only fetched ${allRecords.length} of ${totalCount} records!`);
          console.warn(`⚠️ Check if searchObj has in_limit set. Review DIAGNOSTIC logs above.`);
          
          // Show warning to user
          await Actions.fireNotificationEvent(context, {
            summary: 'Partial Export Warning',
            message: `Exporting ${allRecords.length} of ${totalCount} total records. Check console for details.`,
            displayMode: 'transient',
            type: 'warning'
          });
        }

        if (allRecords.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No records to export',
            message: response.body.OUT_DESCRIPTION || 'No data available',
            displayMode: 'transient',
            type: 'warning'
          });
          return;
        }

        // ✅ STEP 2: Load ExcelJS library dynamically from CDN
        console.log("📦 Loading ExcelJS library from CDN...");

        const ExcelJS = await this.loadExcelJS();

        if (!ExcelJS) {
          throw new Error('Failed to load ExcelJS library from CDN');
        }

        console.log("✅ ExcelJS library loaded successfully");

        // ✅ STEP 3: Create workbook with proper configuration
        console.log("📚 Creating workbook...");
        const workbook = new ExcelJS.Workbook();

        // ✅ CRITICAL: Set proper workbook properties for Excel compatibility
        workbook.creator = 'VBCS Calendar Export';
        workbook.lastModifiedBy = 'VBCS Application';
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();
        
        // Add worksheet with proper name (no special characters)
        const worksheet = workbook.addWorksheet('Calendar Details', {
          properties: {
            tabColor: { argb: 'FF115858' },
            defaultRowHeight: 20
          },
          pageSetup: {
            paperSize: 9, // A4
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            printArea: 'A1:Z1000'
          }
        });

        // ✅ STEP 4: Define columns with proper widths
        console.log("📋 Configuring columns for Calendar Details...");

        // ✅ CRITICAL: Define columns BEFORE adding any data
        worksheet.columns = [
          { header: 'S. No.', key: 'serial_no', width: 10 },
          { header: 'Calendar ID', key: 'xxpmis_cal_hdr_id', width: 15 },
          { header: 'Calendar Type', key: 'calendar_type', width: 15 },
          { header: 'Calendar Name', key: 'calendar_name', width: 30 },
          { header: 'Description', key: 'description', width: 40 },
          { header: 'Enabled Flag', key: 'enabled_flag', width: 15 },
          { header: 'Created By', key: 'created_by', width: 15 },
          { header: 'Creation Date', key: 'creation_date', width: 22 },
          { header: 'Last Updated By', key: 'last_updated_by', width: 18 },
          { header: 'Last Update Date', key: 'last_update_date', width: 22 },
          { header: 'Last Update Login', key: 'last_update_login', width: 18 }
        ];

        // ✅ STEP 5: Style header row (Row 1)
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
          fgColor: { argb: 'FF115858' }
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
        headerRow.commit(); // ✅ CRITICAL: Commit header row

        // ✅ STEP 6: Add data rows with validation and sanitization
        console.log("📊 Adding styled data rows...");

        allRecords.forEach((record, index) => {
          try {
            // ✅ CRITICAL: Sanitize and validate data before adding
            const rowData = {
              serial_no: index + 1,
              xxpmis_cal_hdr_id: this.sanitizeValue(record.xxpmis_cal_hdr_id),
              calendar_type: this.sanitizeValue(record.calendar_type),
              calendar_name: this.sanitizeValue(record.calendar_name),
              description: this.sanitizeValue(record.description),
              enabled_flag: this.sanitizeValue(record.enabled_flag),
              created_by: this.sanitizeValue(record.created_by),
              creation_date: this.formatDate(record.creation_date),
              last_updated_by: this.sanitizeValue(record.last_updated_by),
              last_update_date: this.formatDate(record.last_update_date),
              last_update_login: this.sanitizeValue(record.last_update_login)
            };

            const row = worksheet.addRow(rowData);

            // Zebra Striping
            const isEvenRow = (index % 2 === 0);

            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEvenRow ? 'FFF2F2F2' : 'FFFFFFFF' }
            };

            // Font & Alignment
            row.font = { name: 'Calibri', size: 11 };
            row.alignment = { vertical: 'middle', horizontal: 'left' };

            // Center Alignment for specific columns
            row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }; // S. No.
            row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' }; // Calendar ID

            // Apply borders to all cells
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
                right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
              };
            });

            row.commit(); // ✅ CRITICAL: Commit each row

          } catch (rowError) {
            console.error(`❌ Error adding row ${index + 1}:`, rowError);
            // Continue with next row instead of failing entire export
          }
        });

        console.log("📋 Added", allRecords.length, "styled rows");

        // ✅ STEP 7: Add auto-filter and freeze panes
        console.log("🔍 Adding auto-filter and freeze panes...");

        const lastColumnIndex = worksheet.columns.length;
        const lastColumn = this.getExcelColumnName(lastColumnIndex);

        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: lastColumnIndex }
        };

        worksheet.views = [
          { 
            state: 'frozen', 
            xSplit: 0, 
            ySplit: 1,
            topLeftCell: 'A2',
            activeCell: 'A2'
          }
        ];

        console.log(`✅ Auto-filter applied: A1:${lastColumn}1`);

        // ✅ STEP 8: Generate Excel file with proper buffer handling
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const filename = `CalendarDetails_${day}_${month}_${year}.xlsx`;

        console.log("💾 Generating Excel file:", filename);

        // ✅ CRITICAL: Generate buffer with error handling
        let buffer;
        try {
          buffer = await workbook.xlsx.writeBuffer();
          
          if (!buffer || buffer.byteLength === 0) {
            throw new Error('Generated buffer is empty or invalid');
          }
          
          console.log("✅ Buffer generated successfully, size:", buffer.byteLength, "bytes");
          
          // ✅ CRITICAL: Validate buffer is actually an ArrayBuffer
          if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof Uint8Array)) {
            console.warn("⚠️ Buffer type:", buffer.constructor.name);
            // Convert to proper format if needed
            buffer = new Uint8Array(buffer).buffer;
          }
          
        } catch (bufferError) {
          console.error("❌ Buffer generation failed:", bufferError);
          throw new Error(`Failed to generate Excel buffer: ${bufferError.message}`);
        }

        // ✅ CRITICAL: Create blob with proper MIME type
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        if (blob.size === 0) {
          throw new Error('Generated blob is empty - file would be corrupted');
        }

        console.log("✅ Blob created successfully, size:", blob.size, "bytes");

        // ✅ CRITICAL: Download with proper handling
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        
        // ✅ CRITICAL: Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          link.click();
          console.log("📥 Download triggered");
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log("🧹 Cleanup completed");
          }, 2000);
        }, 100);

        console.log("✅ Excel export completed successfully");

        // ✅ Show accurate count in notification
        const notificationMessage = totalCount > allRecords.length 
          ? `Exported ${allRecords.length} of ${totalCount} records (API limit reached)`
          : `File: ${filename}`;

        await Actions.fireNotificationEvent(context, {
          summary: `Successfully exported calendar records`,
          message: notificationMessage,
          displayMode: 'transient',
          type: 'confirmation'
        });

      } catch (error) {
        console.error("❌ Export error:", error);
        console.error("Error stack:", error.stack);

        await Actions.fireNotificationEvent(context, {
          summary: 'Export failed',
          message: error.message || 'An unexpected error occurred',
          displayMode: 'transient',
          type: 'error'
        });
      }
    }

    /**
     * Sanitize value for Excel export
     * @param {any} value - Value to sanitize
     * @returns {string} Sanitized value
     */
    sanitizeValue(value) {
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and trim
      let sanitized = String(value).trim();
      
      // Remove any null bytes or invalid characters
      sanitized = sanitized.replace(/\0/g, '');
      
      // Limit length to prevent Excel issues (max 32,767 characters per cell)
      if (sanitized.length > 32767) {
        sanitized = sanitized.substring(0, 32767);
      }
      
      return sanitized;
    }

    /**
     * Dynamically load ExcelJS library from CDN
     * @returns {Promise} ExcelJS module
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
     * Convert column index to Excel column name
     * @param {number} columnIndex - Column index (1-based)
     * @returns {string} Excel column name
     */
    getExcelColumnName(columnIndex) {
      let columnName = '';
      while (columnIndex > 0) {
        const remainder = (columnIndex - 1) % 26;
        columnName = String.fromCharCode(65 + remainder) + columnName;
        columnIndex = Math.floor((columnIndex - 1) / 26);
      }
      return columnName;
    }

    /**
     * Format date for Excel display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
      if (!dateString) return '';

      try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}`;
      } catch (e) {
        console.error("Date formatting error:", e);
        return '';
      }
    }
  }

  return onHdrExportAction;
});