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

  class exportHeader_AC extends ActionChain {

    /**
     * Export all tender strategy header records to Excel with professional styling
     * Uses dynamic script loading for ExcelJS CDN
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("📊 Starting Excel export with ExcelJS styling...");

        if (!$variables.SearchObj.p_created_by) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Please select an employee before exporting.',
            displayMode: 'persist',
            type: 'error',
          });
          return;
        }

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
        const encryptJs = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: {
            plainText: exportSearchObj,
          },
        });

        // ✅ Validate encryption result
        if (!encryptJs) {
          throw new Error('Encryption failed - no encrypted payload returned');
        }

        const encSearchObj = { payload: encryptJs };

        // Fetch all records
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/post_Nws_Search',
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
        const apiStatus = response.body.OUT_STATUS;

        // ✅ Check if API call was successful
        if (apiStatus !== 'SUCCESS') {
          throw new Error(`API returned status: ${apiStatus} - ${response.body.OUT_DESCRIPTION || 'Unknown error'}`);
        }

        console.log(`✅ Fetched ${allRecords.length} records (Total: ${totalCount})`);

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

        // ✅ STEP 3: Create workbook and worksheet
        console.log("📚 Creating workbook...");
        const workbook = new ExcelJS.Workbook();

        // Set workbook properties
        workbook.creator = 'VBCS Application';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Tender Strategy', {
          pageSetup: {
            paperSize: 9, // A4
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0
          }
        });

        // ✅ STEP 4: Define columns
        console.log("📋 Configuring columns for Tender Strategy...");

        worksheet.columns = [
          { header: 'S. No.', key: 'serial_no', width: 10 },
          { header: 'Request Number', key: 'request_number', width: 25 },
          { header: 'Request Date', key: 'request_date', width: 22 },

          { header: 'Status', key: 'status_name', width: 18 },
          { header: 'Status Code', key: 'status_code', width: 15 },

          { header: 'Person Number', key: 'person_number', width: 15 },
          { header: 'Full Name', key: 'full_name', width: 35 },
          { header: 'Gender', key: 'gender', width: 10 },

          { header: 'Department', key: 'department_name', width: 30 },
          { header: 'Grade', key: 'grade_name', width: 10 },
          { header: 'Job Name', key: 'job_name', width: 30 },
          { header: 'Position', key: 'position_name', width: 30 },
          { header: 'Location', key: 'location_name', width: 20 },
          { header: 'Directorate', key: 'directorate', width: 30 },
          { header: 'Senior Directorate', key: 'senior_directorate', width: 30 },

          { header: 'Comments', key: 'comments', width: 50 },

          { header: 'SCM Team', key: 'scm_team', width: 20 },
          { header: 'Tender Type', key: 'tender_type', width: 15 },
          { header: 'Tender Category', key: 'tender_category', width: 15 },
          { header: 'Tender Category Description', key: 'tender_category_des', width: 35 },
          { header: 'Tender Committee', key: 'tender_committe', width: 20 },

          { header: 'PR Number', key: 'pr_number', width: 25 },
          { header: 'PR Title', key: 'pr_title', width: 40 },
          { header: 'PR Estimated Value', key: 'pr_estimated_value', width: 22 },
          { header: 'Currency', key: 'currency', width: 10 },

          // { header: 'Contract Holder ID', key: 'contract_holder_id', width: 25 },
          { header: 'Holder Full Name', key: 'holder_full_name', width: 35 },
          // { header: 'Contract Owner ID', key: 'contract_owner_id', width: 25 },
          { header: 'Owner Full Name', key: 'owner_full_name', width: 35 },

          { header: 'Procurement Plan', key: 'procurement_plan', width: 15 },

          { header: 'Created By', key: 'created_by', width: 30 },
          { header: 'Created Date', key: 'created_date', width: 22 },
          { header: 'Last Updated By', key: 'last_updated_by', width: 30 },
          { header: 'Last Updated Date', key: 'last_updated_date', width: 22 },
          { header: 'Last Updated Login', key: 'last_updated_login', width: 30 }
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
          fgColor: { argb: 'FF115858' } // ✅ Required header background
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

        allRecords.forEach((record, index) => {
          const row = worksheet.addRow({
            serial_no: index + 1 || '',
            request_number: record.request_number || '',
            request_date: this.formatDate(record.request_date),

            status_name: record.status_name || '',
            status_code: record.status_code || '',

            person_number: record.person_number || '',
            full_name: record.full_name || '',
            gender: record.gender || '',

            department_name: record.department_name || '',
            grade_name: record.grade_name || '',
            job_name: record.job_name || '',
            position_name: record.position_name || '',
            location_name: record.location_name || '',
            directorate: record.directorate || 'N/A',
            senior_directorate: record.senior_directorate || '',

            comments: record.comments || '',

            scm_team: record.scm_team || '',
            tender_type: record.tender_type || '',
            tender_category: record.tender_category || '',
            tender_category_des: record.tender_category_des || '',
            tender_committe: record.tender_committe || '',

            pr_number: record.pr_number || '',
            pr_title: record.pr_title || '',
            pr_estimated_value: record.pr_estimated_value || 0,
            currency: record.currency ? record.currency.toUpperCase() : '',

            // contract_holder_id: record.contract_holder_id || '',
            holder_full_name: record.holder_full_name || '',
            // contract_owner_id: record.contract_owner_id || '',
            owner_full_name: record.owner_full_name || '',

            procurement_plan: record.procurement_plan || '',

            created_by: record.created_by || '',
            created_date: this.formatDate(record.created_date),
            last_updated_by: record.last_updated_by || '',
            last_updated_date: this.formatDate(record.last_updated_date),
            last_updated_login: record.last_updated_login || ''
          });

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

          // Center Alignment for ID Column (col 1)
          row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

          // Format PR Estimated Value
          const prValueColumnIndex = worksheet.columns.findIndex(c => c.key === 'pr_estimated_value') + 1;

          if (prValueColumnIndex > 0) {
            const cell = row.getCell(prValueColumnIndex);
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0.000';
          }

          // Borders for Each Cell
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

        // ✅ STEP 7: Add auto-filter and freeze panes
        console.log("🔍 Adding auto-filter and freeze panes...");

        // Calculate last column dynamically (35 columns = AI)
        const lastColumnIndex = worksheet.columns.length;
        const lastColumn = this.getExcelColumnName(lastColumnIndex);

        worksheet.autoFilter = { from: 'A1', to: `${lastColumn}1` };
        worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

        console.log(`✅ Auto-filter applied: A1:${lastColumn}1`);

        // ✅ STEP 8: Generate and download file
        // const now = new Date();
        // const timestamp = now.getFullYear() + 
        //   String(now.getMonth() + 1).padStart(2, '0') +
        //   String(now.getDate()).padStart(2, '0') + '_' +
        //   String(now.getHours()).padStart(2, '0') +
        //   String(now.getMinutes()).padStart(2, '0') +
        //   String(now.getSeconds()).padStart(2, '0');

        // const filename = `Tender_Strategy_Headers_${timestamp}.xlsx`;

        // console.log("💾 Generating styled file:", filename);

        // ✅ STEP 8: Generate and download file (Custom Date Format)
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');

        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = months[now.getMonth()];
        const year = now.getFullYear();

        const filename = `TenderStrategy_${day}_${month}_${year}.xlsx`;
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
          message: `File: ${filename}`,
          displayMode: 'transient',
          type: 'confirmation'
        });

      } catch (error) {
        console.error("❌ Export error:", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Export failed',
          message: error.message || 'An unexpected error occurred',
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
     * Convert column index to Excel column name (A, B, ... Z, AA, AB, ... AI)
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
     * @returns {string} Formatted date (DD-MMM-YYYY HH:MM)
     */
    formatDate(dateString) {
      if (!dateString) return '';

      try {
        const date = new Date(dateString);

        // Format: DD-MMM-YYYY HH:MM
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
        return dateString;
      }
    }
  }

  return exportHeader_AC;
});