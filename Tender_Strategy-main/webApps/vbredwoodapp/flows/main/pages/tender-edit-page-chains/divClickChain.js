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

  class divClickChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.data
     */
    async run(context, { event, data }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      const momTabRichTextMap = {
        "scope-tab": "tender_scope_work",
        "cost-tab": "tender_cost_estimate",
        "technical-tab": "tender_technical_criteria",
        "commercial-tab": "tender_commercial_criteria",
        "icv-tab": "tender_icv_minimum_info",
        "division-tab": "tender_division_info"
      };

      //now here based on the 
      const selectedSlot = $variables.selectedMOMTab;
      const fieldName = momTabRichTextMap[selectedSlot];

      const rows = $variables.inputTable.rows;
      const columns = $variables.inputTable.columns;

      let tableHTML = `
<table border="1" style="width:100%; border-collapse:collapse; margin-top:1rem;">
  <thead>
    <tr style="background-color:#01474d; color:white;">
`;

      // Header row (empty headers)
      for (let j = 0; j < columns; j++) {
        tableHTML += `
    <th style="padding:8px; text-align:left; border:1px solid #ddd;">
      &nbsp;
    </th>`;
      }

      tableHTML += `
    </tr>
  </thead>
  <tbody>
`;

      // Body rows
      for (let i = 0; i < rows; i++) {
        tableHTML += `<tr>`;
        for (let j = 0; j < columns; j++) {
          tableHTML += `
      <td style="padding:8px; border:1px solid #ddd;">
        &nbsp;
      </td>`;
        }
        tableHTML += `</tr>`;
      }

      tableHTML += `
  </tbody>
</table>
`;




      $variables.postPayloadTypeVar[fieldName] += tableHTML;


      const tablePopupClose = await Actions.callComponentMethod(context, {
        selector: '#tablePopup',
        method: 'close',
      });
    }
  }

  return divClickChain;
});
