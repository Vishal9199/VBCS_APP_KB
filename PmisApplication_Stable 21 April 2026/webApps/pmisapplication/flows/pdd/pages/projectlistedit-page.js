define([], () => {
  'use strict';

  class PageModule {

    getDefaultRecord() {
      return {};
    }

    formatDate(dateString) {
      if (!dateString) return '';
      const d = new Date(dateString);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${String(d.getDate()).padStart(2,'0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    }

  }

  return PageModule;
});