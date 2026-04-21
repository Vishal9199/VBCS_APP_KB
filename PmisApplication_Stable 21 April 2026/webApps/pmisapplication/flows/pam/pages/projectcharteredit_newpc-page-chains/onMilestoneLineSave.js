// define([
//   'vb/action/actionChain',
//   'vb/action/actions',
//   'vb/action/actionUtils',
// ], (
//   ActionChain,
//   Actions,
//   ActionUtils
// ) => {
//   'use strict';

//   class onMilestoneLineSave extends ActionChain {

//     /**
//      * UI-only save: adds/updates milestone in local ArrayDataProvider.
//      * No API call — storage TBD.
//      *
//      * @param {Object} context
//      * @param {Object} params
//      * @param {string} params.isSaveAndClose  'Y' = Save & Close | 'N' = Save & Add Another
//      */
//     async run(context, { isSaveAndClose }) {
//       const { $variables } = context;

//       try {
//         // ── VALIDATION ────────────────────────────────────────────────────
//         if (!$variables.milestoneVar.milestone_name || !$variables.milestoneVar.milestone_name.trim()) {
//           await Actions.fireNotificationEvent(context, {
//             summary: 'Milestone name is required',
//             displayMode: 'transient',
//             type: 'error',
//           });
//           return;
//         }

//         const isCreate = $variables.isMilestoneCreate === 'Y';

//         if (isCreate) {
//           // ── ADD NEW ROW ───────────────────────────────────────────────
//           const newRow = {
//             milestone_id:   $variables.milestoneNextId,
//             milestone_name: $variables.milestoneVar.milestone_name,
//             target_date:    $variables.milestoneVar.target_date || '',
//           };

//           const currentData = $variables.ADPmilestone.data || [];
//           $variables.ADPmilestone.data = [...currentData, newRow];

//           // Increment local ID counter
//           $variables.milestoneNextId = $variables.milestoneNextId + 1;

//           console.log('✅ Milestone added (local):', newRow);

//         } else {
//           // ── UPDATE EXISTING ROW ───────────────────────────────────────
//           const targetId   = $variables.milestoneVar.milestone_id;
//           const currentData = $variables.ADPmilestone.data || [];

//           $variables.ADPmilestone.data = currentData.map(row =>
//             row.milestone_id === targetId
//               ? {
//                   ...row,
//                   milestone_name: $variables.milestoneVar.milestone_name,
//                   target_date:    $variables.milestoneVar.target_date || '',
//                 }
//               : row
//           );

//           console.log('✅ Milestone updated (local):', targetId);
//         }

//         // ── NOTIFY AND HANDLE DIALOG ──────────────────────────────────────
//         await Actions.fireNotificationEvent(context, {
//           summary: isCreate ? 'Milestone added' : 'Milestone updated',
//           displayMode: 'transient',
//           type: 'confirmation',
//         });

//         if (isSaveAndClose === 'Y') {
//           const dialog = document.getElementById('milestoneDialog');
//           if (dialog) dialog.close();
//         } else {
//           // Save & Add Another — reset form
//           await Actions.resetVariables(context, {
//             variables: ['$variables.milestoneVar'],
//           });
//           $variables.milestoneVar.milestone_id = 0;
//           $variables.isMilestoneCreate = 'Y';
//         }

//       } catch (error) {
//         console.error('❌ onMilestoneLineSave error:', error);
//         await Actions.fireNotificationEvent(context, {
//           summary: 'Error: ' + (error.message || 'Unexpected error'),
//           displayMode: 'transient',
//           type: 'error',
//         });
//       }
//     }
//   }

//   return onMilestoneLineSave;
// });

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

  class onMilestoneLineSave extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.isSaveAndClose  'Y' = Save & Close | 'N' = Save & Add Another
     */
    async run(context, { isSaveAndClose }) {
      const { $variables, $application } = context;

      try {
        // ── VALIDATION ────────────────────────────────────────────────────
        if (!$variables.projectCharterVar.project_charter_id) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error: Parent record not saved',
            message: 'Please save the Project Charter header first before adding milestones.',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        if (!$variables.milestoneVar.milestone || !$variables.milestoneVar.milestone.trim()) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Milestone name is required',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // ── MODE DETERMINATION ────────────────────────────────────────────
        const isCreateMode = $variables.isMilestoneCreate === 'Y';
        const httpMethod   = isCreateMode ? 'POST' : 'PUT';
        const keyToEncrypt = isCreateMode
          ? '0'
          : String($variables.milestoneVar.milestone_id || '0');

        console.log(`🔗 ${isCreateMode ? 'CREATE' : 'UPDATE'} Milestone`);

        // ── ENCRYPT KEY ───────────────────────────────────────────────────
        const enc_session_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: keyToEncrypt },
        });

        // ── ENCRYPT METHOD ────────────────────────────────────────────────
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: httpMethod },
        });

        // ── BUILD PAYLOAD ─────────────────────────────────────────────────
        // const payload = {
        //   milestone_id:       isCreateMode ? 0 : $variables.milestoneVar.milestone_id,
        //   project_charter_id: $variables.projectCharterVar.project_charter_id,
        //   milestone_code:     $variables.milestoneVar.milestone_code || null,
        //   milestone:          $variables.milestoneVar.milestone,
        //   by_target_date:        $variables.milestoneVar.by_target_date || null,
        //   object_version_num: $variables.milestoneVar.object_version_num || 1,
        // };

        const currentUser = $application.user.email;
        const payload = {
          milestone_id:       isCreateMode ? 0 : $variables.milestoneVar.milestone_id,
          project_charter_id: $variables.projectCharterVar.project_charter_id,
          // milestone_code:     $variables.milestoneVar.milestone_code || null,
          milestone:          $variables.milestoneVar.milestone,
          // by_target_date:     $application.functions.formatDateForDB($variables.milestoneVar.by_target_date) || null,
          by_target_date:     $variables.milestoneVar.by_target_date ? String($variables.milestoneVar.by_target_date).split('T')[0] : null,
          object_version_num: $variables.milestoneVar.object_version_num || 1,
          created_by:         currentUser,
          created_date:       $application.functions.getSysdate(),
          last_updated_by:    currentUser,
          last_updated_login: currentUser,
          last_updated_date:  $application.functions.getSysdate()
        };

        console.log('📦 Milestone Payload:', JSON.stringify(payload, null, 2));

        // ── ENCRYPT PAYLOAD ───────────────────────────────────────────────
        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: payload },
        });

        // ── CALL ORDS ─────────────────────────────────────────────────────
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamProjectcharterMilestoneProcess',
          headers: {
            'x-session-id':   enc_session_id,
            'x-session-code': enc_method,
          },
          body: { payload: enc_payload },
        });

        console.log('📥 Milestone Save Response:', response.body);

        // ── HANDLE RESPONSE ───────────────────────────────────────────────
        if (response.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: isCreateMode ? 'Milestone added successfully' : 'Milestone updated successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });

          // Refresh the milestone list
          await Actions.callChain(context, { chain: 'loadMilestones' });

          if (isSaveAndClose === 'Y') {
            const dialog = document.getElementById('milestoneDialog');
            if (dialog) dialog.close();
          } else {
            // Save & Add Another — reset form
            await Actions.resetVariables(context, {
              variables: ['$variables.milestoneVar'],
            });
            $variables.milestoneVar.milestone_id = 0;
            $variables.isMilestoneCreate = 'Y';
          }
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Operation failed',
            displayMode: 'transient',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('❌ onMilestoneLineSave error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + (error.message || 'Unexpected error'),
          displayMode: 'transient',
          type: 'error',
        });
      }
    }
  }

  return onMilestoneLineSave;
});