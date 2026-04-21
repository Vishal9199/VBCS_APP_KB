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

  class weeklyHighlightsSaveAC extends ActionChain {

    /**
     * Save Action Chain for Weekly Highlights Entry
     * - Captures user input FIRST before any GET sync
     * - Checks count from GET endpoint to decide POST vs PUT
     * - After save, re-fetches record to sync weekly_highlights_id
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {

        const currentUser = $application.user.username;
        const currentDate = this.formatDate($application.functions.getSysdate());

        console.log("=== WeeklyHighlights Save START ===");
        console.log("Step1 | currentUser: "        + currentUser);
        console.log("Step1 | periodName: "         + $variables.periodName);
        console.log("Step1 | headerInfoVar: "      + JSON.stringify($variables.headerInfoVar));
        console.log("Step1 | weeklyHighlightsVar: " + JSON.stringify($variables.weeklyHighlightsVar));

        // ── Step 2: Read project/tender IDs from headerInfoVar ─────────────
        const oraProjectId = $variables.headerInfoVar.oraProjectId
                             ? parseInt($variables.headerInfoVar.oraProjectId, 10)
                             : null;
        const tenderId     = $variables.headerInfoVar.tenderId
                             ? parseInt($variables.headerInfoVar.tenderId, 10)
                             : null;

        console.log("Step2 | oraProjectId: " + oraProjectId + " | tenderId: " + tenderId);

        if (!oraProjectId || !tenderId) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Project and Tender information is missing. Cannot save.',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // ── Step 3: Capture user's current form input BEFORE any GET sync ──
        // CRITICAL: Must snapshot here — GET sync below will overwrite weeklyHighlightsVar
        const userInput = { ...$variables.weeklyHighlightsVar };
        console.log("Step3 | userInput snapshot: " + JSON.stringify(userInput));

        // ── Step 4: Check count — GET by period to decide POST or PUT ──────
        console.log("Step4 | Checking existing record for period: " + $variables.periodName);

        const checkResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddWeeklyhighlightsGetbyperiod',
          uriParams: {
            'p_period': $variables.periodName,
          },
        });

        const items = checkResponse.body.items || [];
        const count = items.length;
        const op    = count > 0 ? 'PUT' : 'POST';

        console.log("Step4 | count: " + count + " | op resolved to: " + op);

        // For PUT — get fresh ID + object_version_num from DB record only
        // (do NOT overwrite userInput — user typed data is preserved in userInput snapshot)
        const dbRecord = count > 0 ? items[0] : null;

        // ── Step 5: Build payload using userInput + dbRecord metadata ───────
        const payload = {
          'ora_project_id': oraProjectId,
          'tender_id':      tenderId,
          'period':         $variables.periodName ?? null,

          // Use userInput for all form fields — this is what user typed
          'week1_highlight_projects': userInput.week1_highlight_projects ?? null,
          'week1_highlight_hse':      userInput.week1_highlight_hse      ?? null,
          'week1_lowlight_projects':  userInput.week1_lowlight_projects  ?? null,
          'week1_lowlight_hse':       userInput.week1_lowlight_hse       ?? null,

          'week2_highlight_projects': userInput.week2_highlight_projects ?? null,
          'week2_highlight_hse':      userInput.week2_highlight_hse      ?? null,
          'week2_lowlight_projects':  userInput.week2_lowlight_projects  ?? null,
          'week2_lowlight_hse':       userInput.week2_lowlight_hse       ?? null,

          'week3_highlight_projects': userInput.week3_highlight_projects ?? null,
          'week3_highlight_hse':      userInput.week3_highlight_hse      ?? null,
          'week3_lowlight_projects':  userInput.week3_lowlight_projects  ?? null,
          'week3_lowlight_hse':       userInput.week3_lowlight_hse       ?? null,

          'week4_highlight_projects': userInput.week4_highlight_projects ?? null,
          'week4_highlight_hse':      userInput.week4_highlight_hse      ?? null,
          'week4_lowlight_projects':  userInput.week4_lowlight_projects  ?? null,
          'week4_lowlight_hse':       userInput.week4_lowlight_hse       ?? null,

          'week5_highlight_projects': userInput.week5_highlight_projects ?? null,
          'week5_highlight_hse':      userInput.week5_highlight_hse      ?? null,
          'week5_lowlight_projects':  userInput.week5_lowlight_projects  ?? null,
          'week5_lowlight_hse':       userInput.week5_lowlight_hse       ?? null,

          'additional_info':    userInput.additional_info    ?? null,
          'last_updated_by':    currentUser,
          'last_updated_date':  currentDate,
          'last_updated_login': currentUser,
        };

        if (op === 'POST') {
          payload['object_version_num'] = 0;
          payload['created_by']         = currentUser;
          payload['created_date']       = currentDate;
        }

        if (op === 'PUT') {
          // Use DB record for ID + version + created audit — not userInput
          payload['weekly_highlights_id'] = parseInt(dbRecord.weekly_highlights_id, 10);
          payload['object_version_num']   = parseInt(dbRecord.object_version_num, 10) || 1;
          payload['created_by']           = dbRecord.created_by;
          payload['created_date']         = this.formatDate(dbRecord.created_date);
          console.log("Step5 | PUT | weekly_highlights_id: " + payload['weekly_highlights_id']);
        }

        console.log("Step5 | Final payload: " + JSON.stringify(payload));

        // ── Step 6: Encrypt and call REST ──────────────────────────────────
        const enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: op === 'PUT' ? payload.weekly_highlights_id.toString() : '0' },
        });

        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: op },
        });

        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: payload },
        });

        console.log("Step6 | Calling REST...");

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddWeeklyhighlightsProcess',
          headers: {
            'x-session-id':   enc_key,
            'x-session-code': enc_method,
          },
          body: {
            payload: enc_payload,
          },
        });

        console.log("Step6 | Response status: " + response.status);
        console.log("Step6 | Response body: "   + JSON.stringify(response.body));

        // ── Step 7: Handle response ────────────────────────────────────────
        if (response.body.P_ERR_CODE === 'S' || response.body.P_ERR_CODE === 's') {

          console.log("Step7 | SUCCESS - re-fetching record to sync latest data...");

          // Re-fetch to sync weeklyHighlightsVar with saved DB record
          const refreshResponse = await Actions.callRest(context, {
            endpoint: 'PDD/getPmispddWeeklyhighlightsGetbyperiod',
            uriParams: {
              'p_period': $variables.periodName,
            },
          });

          const refreshedItems = refreshResponse.body.items || [];

          if (refreshedItems.length > 0) {
            await Actions.assignVariable(context, {
              variable: '$variables.weeklyHighlightsVar',
              value: refreshedItems[0],
            });
            console.log("Step7 | weeklyHighlightsVar refreshed from DB: " + JSON.stringify(refreshedItems[0]));
          }

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

        } else {
          console.log("Step7 | SERVER ERROR: " + response.body.P_ERR_MSG);
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Save failed. Please try again.',
            displayMode: 'transient',
            type: 'error',
          });
        }

        console.log("=== WeeklyHighlights Save END ===");

      } catch (e) {
        console.error("=== WeeklyHighlights Save EXCEPTION ===");
        console.error("Error name:    " + e.name);
        console.error("Error message: " + e.message);
        console.error("Error stack:   " + e.stack);

        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + e.message,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }

    /**
     * Strips time portion — returns YYYY-MM-DD only
     * @param {string} dateStr
     * @returns {string|null}
     */
    formatDate(dateStr) {
      if (!dateStr) return null;
      return dateStr.toString().substring(0, 10);
    }

  }

  return weeklyHighlightsSaveAC;
});