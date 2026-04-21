define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class saveAction extends ActionChain {

    /**
     * Determines CREATE (POST) or UPDATE (PUT) mode.
     * pddIncId null / 0 / undefined → POST (new record)
     * pddIncId > 0                  → PUT  (existing record)
     */
    // isEditMode(pddIncId) {
    //   return pddIncId != null && pddIncId > 0;
    // }
    

    async run(context) {
      const { $page, $application, $variables } = context;

      let temp_tender_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.inCountryValueVar.tenderId,
        },
      });

      let temp_ora_project_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.inCountryValueVar.oraProjectId,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PDD/getPmispddIcvGetbyid',
        headers: {
          'p_tender_id': temp_tender_id,
          'p_ora_project_id': temp_ora_project_id,
        },
      });

      try {
        document.getElementById('progressDialog').open();

        // ─────────────────────────────────────────────────────────
        // STEP 1: Build payload — all columns from the table
        // ─────────────────────────────────────────────────────────

        // const editMode = this.isEditMode($variables.inCountryValueVar.pddIncId);

        const editMode = $variables.addEditMode;

        const record = {
          pdd_inc_id         : editMode === 'EDIT' ? $variables.inCountryValueVar.pddIncId : 0,
          object_version_num : editMode === 'EDIT' ? ($variables.inCountryValueVar.objectVersionNum || 1) : 1,
          ora_project_id     : $variables.inCountryValueVar.oraProjectId,
          tender_id          : $variables.inCountryValueVar.tenderId,
          perc_sme           : $variables.inCountryValueVar.percSme,
          days_left          : $variables.inCountryValueVar.daysLeft,
          perc_sme_month     : $variables.inCountryValueVar.percSmeMonth,
          additional_info    : $variables.inCountryValueVar.additionalInfo || null,
          created_by         : $application.user.email,
          created_date       : new Date().toISOString(),
          last_updated_by    : $application.user.email,
          last_updated_date  : new Date().toISOString(),
          last_updated_login : $application.user.email,
        };

        const method = editMode === 'EDIT' ? 'PUT' : 'POST';

        console.log(`saveAction [${method}] payload:`, JSON.stringify(record));

        // ─────────────────────────────────────────────────────────
        // STEP 2: Encrypt method, session ID and payload
        // ─────────────────────────────────────────────────────────
        const encryptedMethod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: method },
        });

        const encryptedId = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: editMode === 'EDIT'
              ? String(record.pdd_inc_id)                  // PUT  → encrypt pdd_inc_id
              : String($application.variables.pTenderId),  // POST → encrypt tender_id
          },
        });

        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: JSON.stringify(record) },
        });

        // ─────────────────────────────────────────────────────────
        // STEP 3: Call REST endpoint
        // ─────────────────────────────────────────────────────────
        const saveResponse = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddIcvProcess',  // ← replace with actual endpoint
          body    : { payload: encryptedPayload },
          headers : {
            'x-session-id'  : encryptedId,
            'x-session-code': encryptedMethod,
          },
        });

        // ─────────────────────────────────────────────────────────
        // STEP 4: Handle response
        // ─────────────────────────────────────────────────────────
        if (saveResponse.body && saveResponse.body.P_ERR_CODE === 'S') {

          await Actions.fireNotificationEvent(context, {
            summary     : `In-Country Value record ${editMode ? 'updated' : 'saved'} successfully.`,
            displayMode : 'transient',
            type        : 'confirmation',
          });

          // await Actions.navigateBack(context, {});

        } else {
          const errMsg = saveResponse.body && saveResponse.body.P_ERR_MSG
            ? saveResponse.body.P_ERR_MSG
            : 'Unknown error — check console.';

          console.error(`saveAction [${method}] failed:`, errMsg);

          await Actions.fireNotificationEvent(context, {
            summary     : `Save failed: ${errMsg}`,
            displayMode : 'persist',
            type        : 'error',
          });
        }

      } catch (error) {
        console.error('saveAction error:', error);

        await Actions.fireNotificationEvent(context, {
          summary     : 'Failed to save In-Country Value data.',
          displayMode : 'persist',
          type        : 'error',
        });

      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return saveAction;
});