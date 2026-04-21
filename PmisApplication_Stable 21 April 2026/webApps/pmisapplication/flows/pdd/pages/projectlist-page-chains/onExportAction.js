define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils, ExcelJS) => {
  'use strict';

  class onExportAction extends ActionChain {
    async run(context, { event, originalEvent }) {
      const { $variables } = context;
      try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Projectlist');
        sheet.columns = [
        { header: 'Object Version Num', key: 'object_version_num', width: 20 },
        { header: 'Project Id', key: 'project_id', width: 20 },
        { header: 'Ora Project Id', key: 'ora_project_id', width: 20 },
        { header: 'Tender Id', key: 'tender_id', width: 20 }
        ];
        const data = $variables.projectlistADP.data || [];
        data.forEach(row => sheet.addRow(row));
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g,'-').substring(0,19);
        a.download = 'Projectlist_Export_' + ts + '.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Export error:', err);
        await Actions.fireNotificationEvent(context, {
          summary: 'Export Error', message: err.message, type: 'error', displayMode: 'transient'
        });
      }
    }
  }

  return onExportAction;
});