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

  class sectionCodeChangeAC2 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.value 
     */
    async run(context, { value }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // reset messages
      $variables.sectionCodeCustomMsg = [];

      if (value) {
        // 1) Trim leading/trailing spaces
        let processedValue = value.trim();

        // 2) Replace multiple spaces with single underscore
        processedValue = processedValue.replace(/\s+/g, "_");

        // 3) Convert to uppercase
        const upperValue = processedValue.toUpperCase();

        // 4) Save with underscores
        //  $variables.emailFieldVar.field_code = upperValue;

        // 5) Replace underscores with spaces (for readable name)
        const spacedValue = upperValue.replace(/_/g, " ");

        // 6) Convert to Title Case
        const titleCaseValue = spacedValue
          .toLowerCase()
          .replace(/\b\w/g, (ch) => ch.toUpperCase());

        // ✅ rule: only A–Z, 0–9, and underscore allowed
        const validPattern = /^[A-Z0-9_]+$/;

        if (!validPattern.test(upperValue)) {
          $variables.sectionCodeCustomMsg = [
            {
              severity: "error",
              summary: "Invalid Code",
              detail:
                "Only uppercase letters, numbers, and underscores are allowed."
            }
          ];
        }
          $variables.emailFieldVar.field_label= titleCaseValue;
      }
    }

  }

  return sectionCodeChangeAC2;
});
