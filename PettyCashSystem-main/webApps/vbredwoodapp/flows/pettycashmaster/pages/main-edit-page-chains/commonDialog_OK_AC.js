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

  class onDialogOkCommon extends ActionChain {

    /**
     * Common action chain for handling all dialog OK button actions
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.dialogType - Type of dialog: 'SUBMIT', 'APPROVE', 'REJECT', 'WITHDRAW', 'REASSIGN', 'MOREINFO'
     * @param {string} params.validationKey - Optional validation key from formValidObj (e.g., 'rejectValid', 'reassignValid')
     * @param {string} params.validationSelector - Optional CSS selector for field validation (e.g., '#rejectCmt')
     * @param {string} params.dialogSelector - CSS selector for the dialog to close (e.g., '#approveDialog')
     * @param {string} params.validationMessage - Optional custom validation error message
     */
    async run(context, { dialogType, validationKey, validationSelector, dialogSelector, validationMessage }) {
      const { $page, $flow, $application, $constants, $variables, $functions } = context;

      try {
        // ========================
        // STEP 1: VALIDATION CHECK
        // ========================
        if (validationKey && $variables.formValid_Dialog_Obj[validationKey] !== 'valid') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Validation Error',
            message: validationMessage || 'Please enter all required fields',
            type: 'error',
            displayMode: 'persistent'
          });

          // Validate specific field if selector provided
          if (validationSelector) {
            await Actions.callComponentMethod(context, {
              selector: validationSelector,
              method: 'validate',
            });
          }
          
          return; // Exit early if validation fails
        }

        // ========================
        // STEP 2: SHOW LOADING DIALOG
        // ========================
        await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'open',
        });

        // ========================
        // STEP 3: EXECUTE DIALOG-SPECIFIC LOGIC
        // ========================
        const result = await this.executeDialogLogic(context, dialogType);

        // ========================
        // STEP 4: CLOSE LOADING DIALOG
        // ========================
        await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });

        // ========================
        // STEP 5: HANDLE RESULT
        // ========================
        if (result.success) {
          // Show success notification
          await Actions.fireNotificationEvent(context, {
            summary: result.summary || 'Success',
            message: result.message,
            type: result.type || 'confirmation',
            displayMode: result.displayMode || 'transient',
          });

          // Close the dialog
          if (dialogSelector) {
            await Actions.callComponentMethod(context, {
              selector: dialogSelector,
              method: 'close',
            });
          }

          // Navigate back if needed
          if (result.navigateBack) {
            await Actions.navigateBack(context, {});
          }
        } else {
          // Show error notification
          await Actions.fireNotificationEvent(context, {
            summary: result.summary || 'Error',
            message: result.message || 'An error occurred. Please contact administrator',
            type: 'error',
            displayMode: 'persistent',
          });

          // Optionally close dialog on error
          if (result.closeDialogOnError && dialogSelector) {
            await Actions.callComponentMethod(context, {
              selector: dialogSelector,
              method: 'close',
            });
          }
        }

      } catch (error) {
        // ========================
        // GLOBAL ERROR HANDLING
        // ========================
        console.error(`Error in onDialogOkCommon for ${dialogType}:`, error);
        
        // Close loading dialog if open
        await Actions.callComponentMethod(context, {
          selector: '#loadingDialog',
          method: 'close',
        });

        // Show error notification
        await Actions.fireNotificationEvent(context, {
          summary: 'Unexpected Error',
          message: 'An unexpected error occurred. Please try again.',
          type: 'error',
          displayMode: 'persistent'
        });
      }
    }

    /**
     * Execute dialog-specific logic based on dialog type
     * @param {Object} context
     * @param {string} dialogType
     * @returns {Promise<Object>} Result object with success status and messages
     */
    async executeDialogLogic(context, dialogType) {
      const { $page, $flow, $application, $variables, $functions } = context;

      switch (dialogType) {
        case 'SUBMIT':
          return await this.handleSubmit(context);
        
        case 'APPROVE':
          return await this.handleApprove(context);
        
        case 'REJECT':
          return await this.handleReject(context);
        
        case 'WITHDRAW':
          return await this.handleWithdraw(context);
        
        case 'REASSIGN':
          return await this.handleReassign(context);
        
        case 'MOREINFO':
          return await this.handleMoreInfo(context);
        
        default:
          return {
            success: false,
            summary: 'Invalid Dialog Type',
            message: `Unknown dialog type: ${dialogType}`
          };
      }
    }

    /**
     * Handle SUBMIT dialog logic
     */
    async handleSubmit(context) {
      const { $page, $flow, $application, $variables, $functions } = context;

      try {
        // Prepare request data
        $variables.requestDetailVar.person_id = $variables.toEmployeeObject.person_id;
        $variables.requestDetailVar.requester_email_id = $application.user.email;
        $variables.requestDetailVar.request_type = $variables.pageTitleCode;
        $variables.requestDetailVar.duty_resumption_info = $variables.requestData;

        // Encrypt request
        const encryptJs = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          $variables.requestDetailVar
        );
        $variables.encryptionRequestVar.payload = encryptJs;

        // Get primary key and navigation function
        // const primaryKey = await $functions.getPrimaryKey($variables.pageNavigate, $variables.headerId);
        // const onPageNaviFun = await $functions.onPageNaviFun($variables.pageNavigate);

        const primaryKey = $variables.payload.claim_header_id;

        // This is for the logic to find that this is for PUT or POST operation

        const onPageNaviFun = 'POST' || 'PUT';

        // This is for the logic to find that this is for PUT or POST operation

        // Save record
        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postSelfserviceProcess',
          body: $variables.encryptionRequestVar,
          headers: {
            'X-cache-id': $application.functions.encryptJs($application.constants.secretKey, primaryKey),
            'X-cache-code': $application.functions.encryptJs($application.constants.secretKey, onPageNaviFun),
          },
        });

        if (!response.ok) {
          return {
            success: false,
            summary: 'Save Error',
            message: 'Error in Save Record. Please contact administrator'
          };
        }

        // Update page navigation and header ID
        // $variables.pageNavigate = 'EDIT';
        let pageNavigate = 'EDIT';
        // $variables.headerId = response.headers.get('x-cache-id');
        $variables.pNavId = response.headers.get('x-cache-id');
        // $variables.validationObj.p_request_id = $variables.headerId;

        // ========================================================================
        // VALIDATION API LOGIC - COMMENTED OUT (No postSelfServiceValidation API)
        // ========================================================================
        // Note: The postSelfServiceValidation endpoint is not available
        // If you need to add validation later, uncomment and configure the below code
        
        // const validationResponse = await Actions.callRest(context, {
        //   endpoint: 'ORDS/postSelfServiceValidation',
        //   body: $variables.validationObj,
        // });

        // if (validationResponse.body.p_err_code !== 'S') {
        //   return {
        //     success: false,
        //     summary: 'Validation Error',
        //     message: validationResponse.body.p_err_msg,
        //     closeDialogOnError: true
        //   };
        // }
        // ========================================================================

        // Prepare submit action
        // $flow.variables.submitAction.P_APPR_PROCESS = $variables.pageTitleCode;
        // $flow.variables.submitAction.P_TRX_ID = $variables.pNavId;
        // $flow.variables.submitAction.P_USER_ID = $variables.requestDetailVar.person_id;

        if ($variables.requestDetailVar.status_code === "RIM") {
          // $flow.variables.submitAction.P_TYPE = "MORE_INFO";
        }

        // Submit for approval
        const submitResponse = await Actions.callRest(context, {
          endpoint: 'ORDS/postActionSubmit',
          // body: $flow.variables.submitAction,
        });

        if (submitResponse.body.P_ERROR_CODE !== 'S') {
          return {
            success: false,
            summary: 'Submit Error',
            message: 'Error in Save Record. Please contact administrator'
          };
        }

        // Prepare process instance
        // $flow.variables.submitInstance.dataObject.submitFormArgs.p_ACTION_ID = submitResponse.body.P_ACTION_ID;
        // $flow.variables.submitInstance.dataObject.submitFormArgs.p_APPR_PROCESS = $variables.pageTitleCode;
        // $flow.variables.submitInstance.dataObject.submitFormArgs.p_TRX_ID = $variables.pNavId;
        // $flow.variables.submitInstance.dataObject.submitFormArgs.p_USER_ID = $variables.requestDetailVar.person_id;

        // Set application name based on environment
        // if ($application.constants.appType === 'LIVE') {
        //   $flow.variables.submitInstance.params.applicationName = "PettyCash";
        //   $flow.variables.submitInstance.params.applicationVersion = "1.0";
        //   $flow.variables.submitInstance.params.processName = "Process";
        // } else {
        //   $flow.variables.submitInstance.params.applicationName = "PettyCashUAT";
        //   $flow.variables.submitInstance.params.applicationVersion = "1.0";
        //   $flow.variables.submitInstance.params.processName = "Process";
        // }

        // Start process instance
        const pcsResponse = await Actions.callRest(context, {
          endpoint: 'Vbprocess/postInstances',
          // body: $flow.variables.submitInstance,
        });

        if (!pcsResponse.ok) {
          return {
            success: false,
            summary: 'Process Error',
            message: 'Error in Approval Process'
          };
        }

        return {
          success: true,
          summary: 'Success',
          message: 'Information was saved and Submitted for Approval',
          type: 'info',
          displayMode: 'transient',
          navigateBack: true
        };

      } catch (error) {
        console.error('Error in handleSubmit:', error);
        return {
          success: false,
          summary: 'Submit Error',
          message: 'Error processing submit request'
        };
      }
    }

    /**
     * Handle APPROVE dialog logic
     */
    async handleApprove(context) {
      const { $flow, $variables } = context;

      try {
        // $flow.variables.updateTask.comment = $variables.responseComment || '-';
        // $flow.variables.updateTask.outcome = 'APPROVE';

        const response = await Actions.callRest(context, {
          endpoint: 'Vbprocess/postUpdateTask',
          uriParams: {
            taskId: $variables.taskId,
          },
          // body: $flow.variables.updateTask,
        });

        if (!response.ok) {
          return {
            success: false,
            summary: 'Approval Error',
            message: 'Error in Approval Process. Please contact administrator',
            closeDialogOnError: true
          };
        }

        return {
          success: true,
          summary: 'Approved Successfully',
          type: 'info',
          displayMode: 'transient',
          navigateBack: true
        };

      } catch (error) {
        console.error('Error in handleApprove:', error);
        return {
          success: false,
          summary: 'Approval Error',
          message: 'Error processing approval request'
        };
      }
    }

    /**
     * Handle REJECT dialog logic
     */
    async handleReject(context) {
      const { $flow, $variables } = context;

      try {
        // $flow.variables.updateTask.comment = $variables.responseComment || '-';
        // $flow.variables.updateTask.outcome = 'REJECT';

        const response = await Actions.callRest(context, {
          endpoint: 'Vbprocess/postUpdateTask',
          uriParams: {
            taskId: $variables.taskId,
          },
          // body: $flow.variables.updateTask,
        });

        if (!response.ok) {
          return {
            success: false,
            summary: 'Rejection Error',
            message: 'Error in Approval Process. Please contact administrator',
            closeDialogOnError: true
          };
        }

        return {
          success: true,
          summary: 'Request Rejected Successfully',
          type: 'info',
          displayMode: 'transient',
          navigateBack: true
        };

      } catch (error) {
        console.error('Error in handleReject:', error);
        return {
          success: false,
          summary: 'Rejection Error',
          message: 'Error processing rejection request'
        };
      }
    }

    /**
     * Handle WITHDRAW dialog logic
     */
    async handleWithdraw(context) {
      const { $flow, $application, $variables } = context;

      try {
        // $flow.variables.updateAction.P_COMMENTS = $application.functions.encryptJs(
        //   $application.constants.secretKey, 
        //   $variables.responseComment
        // );

        const withdrawJs = await Actions.callRest(context, {
          endpoint: 'ORDS/postUpdateAction',
          // body: $flow.variables.updateAction,
        });

        if (withdrawJs.body.P_ERROR_CODE !== 'S') {
          return {
            success: false,
            summary: 'Withdrawal Error',
            message: 'Error in Withdrawal. Please contact administrator'
          };
        }

        // Reset process terminate variable
        // await Actions.resetVariables(context, {
        //   variables: ['$flow.variables.processTerminateVar'],
        // });

        // $flow.variables.processTerminateVar.instanceActionProps.reason = $variables.responseComment;

        const response = await Actions.callRest(context, {
          endpoint: 'Vbprocess/putProcessTerminate',
          uriParams: {
            // 'p_instance_id': $flow.variables.updateAction.P_INSTANCE_NUMBER,
          },
          // body: $flow.variables.processTerminateVar,
        });

        if (!response.ok) {
          return {
            success: false,
            summary: 'Withdrawal Error',
            message: 'Error in withdrawn Process. Please contact administrator',
            closeDialogOnError: true
          };
        }

        return {
          success: true,
          summary: 'Success',
          message: 'Request Successfully Withdrawn',
          type: 'confirmation',
          displayMode: 'transient',
          navigateBack: true
        };

      } catch (error) {
        console.error('Error in handleWithdraw:', error);
        return {
          success: false,
          summary: 'Withdrawal Error',
          message: 'Error processing withdrawal request'
        };
      }
    }

    /**
     * Handle REASSIGN dialog logic
     */
    async handleReassign(context) {
      const { $flow, $application, $variables } = context;

      try {
        // $flow.variables.updateAction.P_COMMENTS = $application.functions.encryptJs(
        //   $application.constants.secretKey, 
        //   $variables.responseComment
        // );

        const response = await Actions.callRest(context, {
          endpoint: 'ORDS/postUpdateAction',
          // body: $flow.variables.updateAction,
        });

        if (response.body.P_ERROR_CODE !== 'S') {
          return {
            success: false,
            summary: 'Reassign Error',
            message: 'Error in Assign. Please contact Administrator'
          };
        }

        // Suspend process
        // const suspendRes = await Actions.callRest(context, {
        //   endpoint: 'Vbprocess/putProcessSuspend',
        //   uriParams: {
        //     'instance_number': $flow.variables.updateAction.P_INSTANCE_NUMBER,
        //   },
        //   body: $flow.variables.suspendObj,
        // });

        // if (!suspendRes.ok) {
        //   return {
        //     success: false,
        //     summary: 'Reassign Error',
        //     message: 'Error In Reassign. Please Contact Administrator'
        //   };
        // }

        // Get current activity list
        const activityListRes = await Actions.callRest(context, {
          endpoint: 'Vbprocess/getCurrentInstanceActivities',
          uriParams: {
            // 'p_instance_number': $flow.variables.updateAction.P_INSTANCE_NUMBER,
          },
        });

        if (!activityListRes.ok) {
          return {
            success: false,
            summary: 'Reassign Error',
            message: 'Error In Assign. Please Contact Administrator'
          };
        }

        $variables.currentActivity = activityListRes.body.activities[0].activityId;

        // Get all activity list
        const allActivityList = await Actions.callRest(context, {
          endpoint: 'Vbprocess/getInstanceActivitiesList',
          uriParams: {
            // 'p_instance_number': $flow.variables.updateAction.P_INSTANCE_NUMBER,
          },
        });

        if (!allActivityList.ok) {
          return {
            success: false,
            summary: 'Reassign Error',
            message: 'Error In Assign. Please Contact Administrator'
          };
        }

        $variables.nextActivity = allActivityList.body.activities[0].activityId;

        // Prepare alter flow object
        // $flow.variables.alterFlowObj.instanceActionProps.reason = $variables.responseComment;
        // $flow.variables.alterFlowObj.instanceActionProps.sourceActivityId = $variables.currentActivity;
        // $flow.variables.alterFlowObj.instanceActionProps.destinationActivityId = $variables.nextActivity;

        // Alter flow
        // const alterFlowRes = await Actions.callRest(context, {
        //   endpoint: 'Vbprocess/putAlterFlow',
        //   uriParams: {
        //     'p_instance_number': $flow.variables.updateAction.P_INSTANCE_NUMBER,
        //   },
        //   body: $flow.variables.alterFlowObj,
        // });

        // if (!alterFlowRes.ok) {
        //   return {
        //     success: false,
        //     summary: 'Reassign Error',
        //     message: 'Error in Reassign Process. Please Contact Administrator'
        //   };
        // }

        return {
          success: true,
          summary: 'Reassigned Successfully',
          type: 'info',
          displayMode: 'transient',
          navigateBack: true
        };

      } catch (error) {
        console.error('Error in handleReassign:', error);
        return {
          success: false,
          summary: 'Reassign Error',
          message: 'Error processing reassign request'
        };
      }
    }

    /**
     * Handle MORE INFO dialog logic
     */
    async handleMoreInfo(context) {
      const { $flow, $application, $variables } = context;

      try {
        // $flow.variables.updateAction.P_COMMENTS = $application.functions.encryptJs(
        //   $application.constants.secretKey, 
        //   $variables.responseComment
        // );

        const moreinfRes = await Actions.callRest(context, {
          endpoint: 'ORDS/postUpdateAction',
          // body: $flow.variables.updateAction,
        });

        if (moreinfRes.body.P_ERROR_CODE !== 'S') {
          return {
            success: false,
            summary: 'More Info Error',
            message: 'Error in More Info Process. Please contact administrator'
          };
        }

        // Reset process terminate variable
        await Actions.resetVariables(context, {
          // variables: ['$flow.variables.processTerminateVar'],
        });

        // $flow.variables.processTerminateVar.instanceActionProps.reason = $variables.responseComment;

        const response = await Actions.callRest(context, {
          endpoint: 'Vbprocess/putProcessTerminate',
          uriParams: {
            // 'p_instance_id': $flow.variables.updateAction.P_INSTANCE_NUMBER,
          },
          // body: $flow.variables.processTerminateVar,
        });

        if (!response.ok) {
          return {
            success: false,
            summary: 'More Info Error',
            message: 'Error in More Info Process. Please contact administrator'
          };
        }

        return {
          success: true,
          summary: 'More Information request submitted successfully',
          message: 'Request approved successfully',
          type: 'confirmation',
          displayMode: 'transient',
          navigateBack: true
        };

      } catch (error) {
        console.error('Error in handleMoreInfo:', error);
        return {
          success: false,
          summary: 'More Info Error',
          message: 'Error processing more info request'
        };
      }
    }
  }

  return onDialogOkCommon;
});