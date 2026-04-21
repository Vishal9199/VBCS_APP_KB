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

  class exportAction extends ActionChain {

    /**
     * Export current table data to Excel
     * Triggered by Export button
     * @param {Object} context
     */
    async run(context) {
      const { $page, $variables } = context;

      try {
        console.log("📊 Export Action Started");

        // ✅ Check if there's data to export
        const tableData = $variables.projectAssignmentADP.data || [];
        
        if (tableData.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No Data',
            message: 'No data available to export',
            type: 'warning',
            displayMode: 'transient'
          });
          return;
        }

        console.log(`📄 Exporting ${tableData.length} records`);

        // ✅ Check if ExcelJS is available
        // ✅ Load ExcelJS from CDN
        const ExcelJS = await this.loadExcelJS();
        if (!ExcelJS) throw new Error('Failed to load ExcelJS library');

        // ✅ Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Project Assignments');

        // ✅ Define columns based on your table structure
        worksheet.columns = [
          { header: 'Assignment ID', key: 'project_assignment_id', width: 15 },
          { header: 'Tender Number', key: 'tender_number', width: 20 },
          { header: 'Tender ID', key: 'tender_id', width: 12 },
          { header: 'Project Name', key: 'project_name', width: 30 },
          { header: 'Project ID', key: 'project_id', width: 12 },
          { header: 'ORA Project ID', key: 'ora_project_id', width: 15 },
          { header: 'Line Number', key: 'line_num', width: 12 },
          { header: 'Focal Point', key: 'focal_point', width: 25 },
          { header: 'Focal Point User ID', key: 'focal_point_user_id', width: 18 },
          { header: 'Senior Manager', key: 'senior_manager_name', width: 25 },
          { header: 'Senior Manager ID', key: 'senior_mgr_user_id', width: 18 },
          { header: 'Project Manager', key: 'project_manager_name', width: 25 },
          { header: 'Project Manager ID', key: 'proj_mgr_user_id', width: 18 },
          { header: 'Project Engineer', key: 'project_engineer_name', width: 25 },
          { header: 'Project Engineer ID', key: 'proj_engg_user_id', width: 18 },
          { header: 'Comments', key: 'comments', width: 30 },
          { header: 'Additional Info', key: 'additional_info', width: 30 },
          { header: 'Object Version', key: 'object_version_num', width: 15 },
          { header: 'Created By', key: 'created_by', width: 20 },
          { header: 'Created Date', key: 'created_date', width: 20 },
          { header: 'Last Updated By', key: 'last_updated_by', width: 20 },
          { header: 'Last Updated Date', key: 'last_updated_date', width: 20 },
          { header: 'Last Updated Login', key: 'last_updated_login', width: 20 }
        ];

        // ✅ Style header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF084c4c' } // Your color theme #084c4c
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // ✅ Add data rows
        tableData.forEach(row => {
          worksheet.addRow({
            project_assignment_id: row.project_assignment_id,
            tender_number: row.tender_number,
            tender_id: row.tender_id,
            project_name: row.project_name,
            project_id: row.project_id,
            ora_project_id: row.ora_project_id,
            line_num: row.line_num,
            focal_point: row.focal_point,
            focal_point_user_id: row.focal_point_user_id,
            senior_manager_name: row.senior_manager_name,
            senior_mgr_user_id: row.senior_mgr_user_id,
            project_manager_name: row.project_manager_name,
            proj_mgr_user_id: row.proj_mgr_user_id,
            project_engineer_name: row.project_engineer_name,
            proj_engg_user_id: row.proj_engg_user_id,
            comments: row.comments,
            additional_info: row.additional_info,
            object_version_num: row.object_version_num,
            created_by: row.created_by,
            created_date: row.created_date ? $page.functions.formatDate(row.created_date) : '',
            last_updated_by: row.last_updated_by,
            last_updated_date: row.last_updated_date ? $page.functions.formatDate(row.last_updated_date) : '',
            last_updated_login: row.last_updated_login
          });
        });

        // ✅ Apply borders to all cells
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });

        // ✅ Generate file name with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `Project_Assignments_${timestamp}.xlsx`;

        // ✅ Generate Excel file and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log(`✅ File exported: ${fileName}`);

        // ✅ Show success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Export Successful',
          message: `${tableData.length} records exported to ${fileName}`,
          type: 'confirmation',
          displayMode: 'transient'
        });

      } catch (error) {
        console.error("❌ Export Error: ", error);

        await Actions.fireNotificationEvent(context, {
          summary: 'Export Failed',
          message: 'Failed to export data: ' + error.message,
          type: 'error',
          displayMode: 'transient'
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
  }

  return exportAction;
});