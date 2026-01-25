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

  class saveAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.showFireNotification
     * @param {boolean} params.closeLoadingDialog
     */
    async run(context, { showFireNotification = true, closeLoadingDialog = true }) {
      const { $variables, $functions } = context;

      let failedClobs = [];

      try {

        // =====================================================
        // VALIDATION
        // =====================================================
        if (
          $variables.allFormsValidObj.m_info !== 'valid' ||
          $variables.allFormsValidObj.pr_po_details !== 'valid'
        ) {

          if ($variables.allFormsValidObj.m_info !== 'valid') {
            await $functions.handleValidationError('mom_info_validation');
          }

          if ($variables.allFormsValidObj.pr_po_details !== 'valid') {
            await $functions.handleValidationError('pr_po_validation');
          }

          return; // stop execution, no explicit return value
        }

        // =====================================================
        // SHOW PROGRESS
        // =====================================================
        await Actions.callComponentMethod(context, {
          selector: '#progressMsg',
          method: 'open',
        });

        // =====================================================
        // STEP 1: SAVE NORMAL FIELDS
        // =====================================================
        const normalResult = await this.saveNormalFields(context);

        if (!normalResult.success) {
          throw new Error(normalResult.message);
        }

        await this.fetchLatestVersion(context);

        // =====================================================
        // STEP 2: SAVE MODIFIED CLOB FIELDS
        // =====================================================
        failedClobs = await this.saveModifiedClobs(context);

        // =====================================================
        // FINAL SUCCESS NOTIFICATION
        // =====================================================
        if (failedClobs.length === 0 && showFireNotification) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Information saved successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });
        }

        if (failedClobs.length > 0) {
          throw new Error();
        }

      } catch (error) {

        // =====================================================
        // ERROR / PARTIAL SUCCESS HANDLING
        // =====================================================
        if (failedClobs.length > 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Save completed with issues',
            message: 'Failed sections: ' + failedClobs.join(', '),
            displayMode: 'persist',
            type: 'warning',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: error?.message || 'Unexpected error occurred',
            displayMode: 'persist',
            type: 'error',
          });
        }

      } finally {

        if (closeLoadingDialog) {

          await Actions.callComponentMethod(context, {
            selector: '#progressMsg',
            method: 'close',
          });

        }

      }
    }


    // =====================================================
    // SAVE ONLY MODIFIED CLOB FIELDS
    // =====================================================
    async saveModifiedClobs(context) {
      const { $variables } = context;

      const clobFields = [
        { code: 'TENDER_OBJECTIVE', key: 'tender_objective' },
        { code: 'TENDER_BACKGROUND', key: 'tender_background' },
        { code: 'TENDER_SCOPE_WORK', key: 'tender_scope_work' },
        { code: 'TENDER_COST_ESTIMATE', key: 'tender_cost_estimate' },
        { code: 'TENDER_TECHNICAL_CRITERIA', key: 'tender_technical_criteria' },
        { code: 'TENDER_COMMERCIAL_CRITERIA', key: 'tender_commercial_criteria' },
        { code: 'TENDER_ICV_MINIMUM_INFO', key: 'tender_icv_minimum_info' },
        { code: 'TENDER_DIVISION_INFO', key: 'tender_division_info' },
      ];

      let failedClobs = [];

      for (const field of clobFields) {

        const currentValue =
          $variables.postPayloadTypeVar[field.key]
            ? String($variables.postPayloadTypeVar[field.key]).trim()
            : '';

        const originalValue =
          $variables.originalClobValues?.[field.key]
            ? String($variables.originalClobValues[field.key]).trim()
            : '';

        // Save only if modified
        if (currentValue === originalValue) {
          continue;
        }

        const result = await this.saveClobField(
          field.code,
          currentValue,
          context
        );

        if (!result.success) {
          failedClobs.push(field.code);
        } else {
          await this.fetchLatestVersion(context);
          $variables.originalClobValues[field.key] = currentValue;
        }
      }

      return failedClobs;
    }

    // =====================================================
    // FETCH LATEST VERSION
    // =====================================================
    async fetchLatestVersion(context) {
      const { $variables } = context;

      try {
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/getTenderStrategyDtl2',
          headers: {
            'X-session-id': $variables.pNavId,
          },
        });

        if (response.body?.object_version_num !== undefined) {
          $variables.postPayloadTypeVar.object_version_num =
            response.body.object_version_num;
        } else {
          $variables.postPayloadTypeVar.object_version_num += 1;
        }

      } catch {
        $variables.postPayloadTypeVar.object_version_num += 1;
      }
    }

    // =====================================================
    // SAVE NORMAL FIELDS
    // =====================================================
    async saveNormalFields(context) {
      const { $variables } = context;

      try {

        $variables.postTenderVar_Normal = $variables.postPayloadTypeVar;
        const payload = JSON.stringify($variables.postTenderVar_Normal);

        const encryptedPayload = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: { plainText: payload },
        });

        const encryptedMethod = await Actions.callChain(context, {
          chain: 'application:encryptLargePayloadWithTime',
          params: { plainText: 'PUT' },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postTenderStrategyProcess2',
          body: { payload: encryptedPayload },
          headers: {
            'X-session-id': $variables.pNavId,
            'X-session-code': encryptedMethod,
          },
        });

        return {
          success: response.body.P_ERR_CODE === 'S',
          message: response.body.P_ERR_MSG,
        };

      } catch (error) {
        return { success: false, message: error.message };
      }
    }

    async saveClobField(code, content, context) {
      const { $variables, $application } = context;



      try {
        let loginUser = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $application.user.email,
          },
        });

        let objVersion = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.postPayloadTypeVar.object_version_num,
          },
        });

        let hdr_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.postPayloadTypeVar.strategy_hdr_id,
          },
        });

        let typeCode = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: code,
          },
        });
        let sanitizedContent = String(content) || '';

        $variables.encPayload.payload = sanitizedContent;

        console.log(sanitizedContent);
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postTenderStrategyUpdate',
          headers: {
            'x-session-id': hdr_id,
            'x-login-user': loginUser,
            'x-obj-version': objVersion,
            'x-type-code': typeCode,
          },
          body: $variables.encPayload,
        });



        return {
          success: response.body.P_ERR_CODE === 'S',
          message: response.body.P_ERR_MSG,
        };

      } catch (error) {
        return {
          success: false,
          message: error?.message || 'CLOB save failed',
        };
      }
    }

    // =====================================================
    // SAVE SINGLE CLOB
    // =====================================================
    // async saveClobField(code, content, context) {
    //   const { $variables } = context;



    //   try {
    //     const sanitizedContent = content ? String(content).trim() : '';

    //     const clobPayload = {
    //     };

    //     clobPayload.object_version_num = await Actions.callChain(context, {
    //       chain: 'application:encryptLargePayloadWithTime',
    //       params: { plainText: $variables.postPayloadTypeVar.object_version_num },
    //     });

    //     clobPayload.clob_type_code = code;

    //     clobPayload.clob_content = sanitizedContent;

    //     clobPayload.last_updated_by = await Actions.callChain(context, {
    //       chain: 'application:encryptLargePayloadWithTime',
    //       params: { plainText: $variables.postPayloadTypeVar.last_updated_by || 'SYSTEM' },
    //     });

    //     clobPayload.last_updated_login = await Actions.callChain(context, {
    //       chain: 'application:encryptLargePayloadWithTime',
    //       params: { plainText: $variables.postPayloadTypeVar.last_updated_login || 'SYSTEM' },
    //     });

    //     const encryptedMethod = await Actions.callChain(context, {
    //       chain: 'application:encryptLargePayloadWithTime',
    //       params: { plainText: 'PUT_NEW' },
    //     });

    //     console.log(sanitizedContent);
    //     console.log(JSON.stringify(clobPayload, null, 2));

    //     let body = JSON.stringify(clobPayload);

    //     const response = await Actions.callRest(context, {
    //       endpoint: 'ORDS/postTenderStrategyProcess2',
    //       body: body,
    //       headers: {
    //         'X-session-id': $variables.pNavId,
    //         'X-session-code': encryptedMethod,
    //       },
    //     });



    //     return {
    //       success: response.body.P_ERR_CODE === 'S',
    //       message: response.body.P_ERR_MSG,
    //     };

    //   } catch (error) {
    //     return {
    //       success: false,
    //       message: error?.message || 'CLOB save failed',
    //     };
    //   }
    // }

  }

  return saveAction;
});
