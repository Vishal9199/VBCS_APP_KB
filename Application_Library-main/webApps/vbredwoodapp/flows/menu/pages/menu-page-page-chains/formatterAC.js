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

  class formatterAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // reset messages
      $variables.menuCustomMessage = [];

      if (value) {
        // 1) Trim leading/trailing spaces
        let processedValue = value.trim();

        // 2) Replace multiple spaces with single underscore
        processedValue = processedValue.replace(/\s+/g, "_");

        // 3) Convert to uppercase
        const upperValue = processedValue.toUpperCase();

        // 4) Save with underscores
        $variables.menuVar.menu_code = upperValue;

        // 5) Replace underscores with spaces (for readable name)
        const spacedValue = upperValue.replace(/_/g, " ");

        // 6) Convert to Title Case
        const titleCaseValue = spacedValue
          .toLowerCase()
          .replace(/\b\w/g, (ch) => ch.toUpperCase());

        // ✅ Allow ALL special characters (no restriction)
        const validPattern = /^.*$/; // matches everything

        if (!validPattern.test(upperValue)) {
          $variables.menuCustomMessage = [
            {
              severity: "error",
              summary: "Invalid Code",
              detail: "Invalid characters found."
            }
          ];
        }
        
        if ($variables.method === 'POST') {
          $variables.menuVar.menu_name = titleCaseValue;
        }
      }
    }
  }

  return formatterAC;
});
