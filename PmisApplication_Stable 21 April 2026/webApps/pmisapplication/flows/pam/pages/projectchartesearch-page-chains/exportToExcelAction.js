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

  class exportToExcelAction extends ActionChain {

    /**
     * Export ALL project records (across all pages) to Excel
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log("📊 Starting COMPLETE Project List Excel export (ALL PAGES)...");

        // ✅ Show clear notification that ALL records will be exported
        // await Actions.fireNotificationEvent(context, {
        //   summary: 'Exporting ALL records from all pages...',
        //   message: 'This may take a moment for large datasets',
        //   displayMode: 'transient',
        //   type: 'info'
        // });

        // ✅ CRITICAL: Override pagination to fetch ALL records
        const exportPayload = {
          ...$variables.searchObj,
          in_limit: '999999',    // ← Get ALL records (up to 999,999)
          in_offset: '0'         // ← Start from beginning
        };

        console.log("🔍 Fetching ALL records with current filters...");
        console.log("📊 Pagination override: LIMIT=999999, OFFSET=0");

        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { plainText: exportPayload }
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmisProjectCharterSearch',
          body: { payload: encryptedPayload }
        });

        const totalRecords = response.body.OUT_TOTAL_COUNT || 0;
        const recordsReturned = response.body.P_OUTPUT ? response.body.P_OUTPUT.length : 0;

        console.log("✅ Total records in database:", totalRecords);
        console.log("✅ Records fetched for export:", recordsReturned);

        if (!response.body.P_OUTPUT || response.body.P_OUTPUT.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No records to export',
            message: 'Try adjusting your search filters',
            displayMode: 'transient',
            type: 'warning'
          });
          return;
        }

        // ✅ Show progress notification
        await Actions.fireNotificationEvent(context, {
          // summary: `Processing ${recordsReturned} records...`,
          summary: `Processing records...`,
          message: 'Generating Excel file',
          displayMode: 'transient',
          type: 'info'
        });

        // ✅ Load ExcelJS from CDN
        const ExcelJS = await this.loadExcelJS();
        if (!ExcelJS) throw new Error('Failed to load ExcelJS library');

        // ✅ Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'PMIS Application';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Project List', {
          pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        // ✅ Define ALL columns from database
        worksheet.columns = [
          { header: 'S.No', key: 'sno', width: 8 },
          { header: 'Reference Number', key: 'mp_ref_num', width: 20 },
          { header: 'Plan Name', key: 'mp_ref_plan_name', width: 25 },
          { header: 'Project Type Code', key: 'project_type_code', width: 18 },
          { header: 'Project Type', key: 'project_type', width: 18 },
          { header: 'Category Code', key: 'project_category_code', width: 18 },
          { header: 'Project Category', key: 'project_category', width: 18 },
          { header: 'Project Name', key: 'project_name', width: 35 },
          { header: 'Project Long Name', key: 'project_long_name', width: 40 },
          { header: 'Region Code', key: 'region_code', width: 15 },
          { header: 'Region Name', key: 'region_name', width: 25 },
          { header: 'Location Code', key: 'project_location_code', width: 20 },
          { header: 'Project Location', key: 'project_location', width: 25 },
          { header: 'Category Code', key: 'category_code', width: 18 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Description', key: 'description', width: 40 },
          { header: 'Five Year Project', key: 'five_year_prj_flag', width: 18 },
          { header: 'Latest Est. Budget', key: 'latest_est_budget_val', width: 20 },
          { header: 'SCP Approved Budget', key: 'scp_approved_budget_val', width: 20 },
          { header: 'Active Flag', key: 'active_flag', width: 12 },
          { header: 'Inactive Date', key: 'inactive_date', width: 18 },
          { header: 'Calendar Name', key: 'calendar_name', width: 30 },
          { header: 'Comments', key: 'comments', width: 35 },
          { header: 'Additional Info', key: 'additional_info', width: 35 },
          { header: 'Created By', key: 'created_by', width: 25 },
          { header: 'Creation Date', key: 'created_date', width: 18 },
          { header: 'Last Updated By', key: 'last_updated_by', width: 25 },
          { header: 'Last Update Date', key: 'last_updated_date', width: 18 },
          { header: 'Last Update Login', key: 'last_updated_login', width: 25 }
        ];

        // ✅ Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF01474d' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
        headerRow.height = 25;
        headerRow.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };

        // ✅ Add data rows with styling
        let totalLatestBudget = 0;
        let totalApprovedBudget = 0;

        console.log(`📝 Adding ${recordsReturned} rows to Excel...`);

        response.body.P_OUTPUT.forEach((record, index) => {
          const row = worksheet.addRow({
            sno: index + 1,
            mp_ref_num: record.mp_ref_num || '',
            mp_ref_plan_name: record.mp_ref_plan_name || '',
            project_type_code: record.project_type_code || '',
            project_type: record.project_type || '',
            project_category_code: record.project_category_code || '',
            project_category: record.project_category || '',
            project_name: record.project_name || '',
            project_long_name: record.project_long_name || '',
            region_code: record.region_code || '',
            region_name: record.region_name || '',
            project_location_code: record.project_location_code || '',
            project_location: record.project_location || '',
            category_code: record.category_code || '',
            category: record.category || '',
            description: record.description || '',
            five_year_prj_flag: record.five_year_prj_flag || '',
            latest_est_budget_val: record.latest_est_budget_val || 0,
            scp_approved_budget_val: record.scp_approved_budget_val || 0,
            active_flag: record.active_flag || '',
            inactive_date: this.formatDate(record.inactive_date),
            calendar_name: record.calendar_name || '',
            comments: record.comments || '',
            additional_info: record.additional_info || '',
            created_by: record.created_by || '',
            created_date: this.formatDate(record.created_date),
            last_updated_by: record.last_updated_by || '',
            last_updated_date: this.formatDate(record.last_updated_date),
            last_updated_login: record.last_updated_login || ''
          });

          // Calculate totals
          totalLatestBudget += (record.latest_est_budget_val || 0);
          totalApprovedBudget += (record.scp_approved_budget_val || 0);

          // Zebra striping
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: index % 2 === 0 ? 'FFF2F2F2' : 'FFFFFFFF' }
          };

          row.font = { name: 'Calibri', size: 11 };
          row.alignment = { vertical: 'middle', horizontal: 'left' };

          // Center S.No
          row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

          // Right align budget columns (18 & 19)
          [18, 19].forEach(col => {
            row.getCell(col).alignment = { vertical: 'middle', horizontal: 'right' };
            row.getCell(col).numFmt = '#,##0.000';
          });

          // Center align flag columns (17, 20)
          [17, 20].forEach(col => {
            row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' };
          });

          // Borders
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
            };
          });
        });

        console.log(`✅ Successfully added ${recordsReturned} rows to Excel`);

        // ✅ Add summary row
        worksheet.addRow([]);
        const summaryRow = worksheet.addRow([
          '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'TOTAL',
          totalLatestBudget, totalApprovedBudget,
          '', '', '', '', '', '', '', '', '', ''
        ]);

        summaryRow.font = { name: 'Calibri', size: 12, bold: true };
        summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
        summaryRow.alignment = { vertical: 'middle', horizontal: 'right' };
        summaryRow.getCell(18).numFmt = '#,##0.000';
        summaryRow.getCell(19).numFmt = '#,##0.000';

        // ✅ Auto-filter and freeze
        worksheet.autoFilter = { from: 'A1', to: 'AC1' };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // ✅ Generate and download
        const date = new Date();
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const filename = `ProjectList_${String(date.getDate()).padStart(2, '0')}_${months[date.getMonth()]}_${date.getFullYear()}.xlsx`;

        console.log("💾 Generating Excel file:", filename);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log("✅ Excel export completed successfully!");
        console.log(`📊 File contains ${recordsReturned} records from ALL pages`);

        // ✅ Show detailed success notification
        await Actions.fireNotificationEvent(context, {
          summary: `✅ Exported ALL ${recordsReturned} records successfully!`,
          message: `File: ${filename} | All pages included | Budget totals calculated`,
          displayMode: 'transient',
          type: 'confirmation'
        });

      } catch (error) {
        console.error("❌ Export error:", error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Export failed',
          message: error.message || 'Unknown error occurred',
          displayMode: 'transient',
          type: 'error'
        });
      }
    }

    /**
     * Load ExcelJS library from CDN
     */
    async loadExcelJS() {
      return new Promise((resolve, reject) => {
        if (window.ExcelJS) {
          resolve(window.ExcelJS);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
        
        script.onload = () => setTimeout(() => {
          window.ExcelJS ? resolve(window.ExcelJS) : reject(new Error('ExcelJS not available'));
        }, 100);
        
        script.onerror = () => reject(new Error('Failed to load ExcelJS from CDN'));
        document.head.appendChild(script);
      });
    }

    /**
     * Format date as DD-MMM-YYYY
     */
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
      } catch (e) {
        return dateString;
      }
    }
  }

  return exportToExcelAction;
});