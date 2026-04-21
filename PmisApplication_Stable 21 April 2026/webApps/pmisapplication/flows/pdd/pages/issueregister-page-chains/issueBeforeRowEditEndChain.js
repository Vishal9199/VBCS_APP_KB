define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class issueBeforeRowEditEndChain extends ActionChain {

    async run(context, { cancelEdit, rowKey, rowIndex, rowData, updatedRow }) {
      const { $page } = context;

      if (!cancelEdit) {
        // Compute derived fields
        const scope    = parseInt(updatedRow.scope)    || 0;
        const time     = parseInt(updatedRow.time)     || 0;
        const cost     = parseInt(updatedRow.cost)     || 0;
        const qhse     = parseInt(updatedRow.qhse)     || 0;
        const progress = parseInt(updatedRow.progress) || 0;

        // Create a NEW object — never mutate the updatedRow reference directly.
        // updatedRow = $variables.lvCurrentRow reference; VBCS forbids direct mutation.
        const finalRow = {
          ...updatedRow,
          total_score: scope + time + cost + qhse,
          status:      (progress === 100) ? 'Completed' : 'In Progress',
        };

        await $page.variables.issueBufferDP.instance.updateItem({
          metadata: { key: rowKey },
          data: finalRow,
        });

        console.log('issueBeforeRowEditEndChain: row updated in BDP, key=', rowKey,
          '| total_score=', finalRow.total_score, '| status=', finalRow.status);
      }
    }
  }

  return issueBeforeRowEditEndChain;
});