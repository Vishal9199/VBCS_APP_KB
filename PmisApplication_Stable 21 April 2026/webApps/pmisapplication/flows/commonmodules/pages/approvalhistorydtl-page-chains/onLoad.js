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

  class onLoad extends ActionChain {

    async run(context) {
      const { $variables } = context;

      try {
        const response = await Actions.callRest(context, {
          endpoint: 'approval/getApprovalhistory',
          headers: {
            p_transaction_id: $variables.pTrxId
          }
        });

        const items = response?.body?.items || [];

        // 🔹 Transform data
        let formattedData = items.map((item, index) => {
          return {
            action_history_id: item.action_history_id,
            sno: index + 1,
            approver: item.approver_user_name || '-',
            role: item.approval_role_name || '-',
            action: item.action_type || '-',
            comments: item.action_comments || '-',
            actionDate: item.action_date || '-'
          };
        });

        console.log("tableData++1", formattedData);

        // $variables.attachmentTableData.data = formattedData;
        $variables.attachmentTableData.data = response.body.items;

      } catch (error) {
        console.error('Error:', error);
        $variables.attachmentTableData.data = [];
      }
    }
  }

  return onLoad;
});