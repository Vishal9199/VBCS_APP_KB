define([], () => {
  'use strict';

  class PageModule {

    todayDate() {
      return new Date().toISOString().split('T')[0];
    }

    pastDate(monthsAgo = 2) {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgo);
      return d.toISOString().split('T')[0];
    }

    formatDate(dateString) {
      if (!dateString) return '';
      const d = new Date(dateString);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${String(d.getDate()).padStart(2,'0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    }

    hasNextPage(offset, currentCount, totalCount) {
      return (Number(offset) + Number(currentCount)) < Number(totalCount);
    }

    hasPreviousPage(offset) { return Number(offset) > 0; }

    getNextOffset(offset, limit) { return Number(offset) + Number(limit); }

    getPreviousOffset(offset, limit) {
      const n = Number(offset) - Number(limit);
      return n < 0 ? 0 : n;
    }

    getExportFilename() {
      const ts = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      return `Projectlist_Export_${ts}.xlsx`;
    }

    safeParseInt(val, def = 0) {
      const p = parseInt(val, 10);
      return isNaN(p) ? def : p;
    }

    getDefaultSearchObject() {
      return {
        in_limit: '10', in_offset: '0',
        p_pdd_project_id: '',
        p_object_version_num: '',
        p_project_id: '',
        p_ora_project_id: '',
        p_tender_id: '',
        p_additional_info: '',
        p_created_by: '',
        p_created_date: '',
        p_last_updated_by: '',
        p_last_updated_date: '',
        p_last_updated_login: '',
        p_keyword: ''
      };
    }
  }

  return PageModule;
});