define([], () => {
  'use strict';

  class PageModule {
    getFieldTypeArray(dataType) {
      const fieldTypeConfig = {
        VARCHAR2: [
          { label: 'TEXTAREA', value: 'TEXTAREA', dataTypeCategory: 'VARCHAR2' },
          { label: 'LOV', value: 'LOV', dataTypeCategory: 'VARCHAR2' },
          { label: 'DEPENDENT LOV', value: 'DEPENDENT_LOV', dataTypeCategory: 'VARCHAR2' },
          { label: 'CHECKBOX', value: 'CHECKBOX', dataTypeCategory: 'VARCHAR2' },
          { label: 'STRING', value: 'STRING', dataTypeCategory: 'VARCHAR2' }
        ],

        NUMBER: [
          { label: 'NUMBER', value: 'NUMBER', dataTypeCategory: 'NUMBER' }
        ],

        DATE: [
          { label: 'DATE', value: 'DATE', dataTypeCategory: 'DATE' }
        ]
      };

      return fieldTypeConfig[dataType] || [];
    }

  }

  return PageModule;
});
