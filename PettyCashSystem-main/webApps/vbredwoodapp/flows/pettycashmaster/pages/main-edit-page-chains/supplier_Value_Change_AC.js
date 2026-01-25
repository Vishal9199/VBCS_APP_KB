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

  class supplier_Value_Change_AC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {any} params.data
     * @param {any} params.metadata
     * @param {any} params.valueItem
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value !== null || value !== '' || value !== undefined) {
        $variables.temp_Supplier_Site = data.supplier_site_code;

        // payload data for supplier
        $variables.payload.supplier_name = data.supplier_name;
        $variables.payload.supplier_number = data.supplier_number;
      }
    }
  }

  return supplier_Value_Change_AC;
});
