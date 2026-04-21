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

  class onHdrSaveAction extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if ($variables.formValidation === "valid" && $variables.postTypHdrVar.project_id !== 0) {

        await Actions.fireNotificationEvent(context, {
          summary: 'Saving...',
          message: 'Saving Three Year Plan data',
          type: 'info',
          displayMode: 'transient',
        });

        if ($variables.pNavCode === 'EDIT') {
          await this.updateThreeYearPlan(context);

          await Actions.callChain(context, {
            chain: 'vbEnterListener',
          });
        } else {
          await this.createThreeYearPlan(context);
        }

      } else {
        await Actions.fireNotificationEvent(context, {
          summary: 'Enter Required Fields',
        });

        await Actions.fireNotificationEvent(context, {
          summary: $variables.formValidation,
        });
      }
    }

    /**
     * @param {Object} context
     */
    async createThreeYearPlan(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      let p_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'POST',
        },
      });

      let encryptedPayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postTypHdrVar,
        },
      });

      const response = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamFiveyearplandtlProcess',
        headers: {
          'x-session-code': p_method,
          'x-session-id': $variables.pNavId,
        },
        body: {
          payload: encryptedPayload,
        },
      });

      if (response.body.P_ERR_CODE === 'S') {
        const newFyId = response.headers.get('X-Session-Id') || response.headers.get('x-session-id') ||
          response.headers.get('X-session-id');

        $variables.pNavCode = 'EDIT';
        $variables.pNavId = newFyId;
        $variables.editMode = 'edit';

        let p_primary_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: '0',
          },
        });

        const createTypCostVar = {
          fy_budget_cost_id:  0,
          fy_id:              newFyId,
          fy_plan_id:         0,
          project_id:         $variables.postTypHdrVar.project_id,
          fy_calendar_id:     $variables.postTypHdrVar.fy_calendar_id,
          year_value1:        0,
          year_value2:        0,
          year_value3:        0,
          year_value4:        0,
          year_value5:        0,
          additional_info:    '',
          object_version_num: 0,
          created_by:         $application.user.email,
          last_updated_by:    $application.user.email,
          last_updated_login: $application.user.email,
        };

        let encryptedbodyVar = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: createTypCostVar,
          },
        });

        const response3 = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamFiveyearplandtlBudgetcostProcess',
          headers: {
            'x-session-code': p_method,
            'x-session-id': p_primary_key,
          },
          body: {
            payload: encryptedbodyVar,
          },
        });

        if (response3.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

          await Actions.callChain(context, {
            chain: 'vbEnterListener',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error while creating budget Cost Detail',
          });
        }
      } else {
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG,
          displayMode: 'transient',
          type: 'error',
        });
      }
    }

    /**
     * @param {Object} context
     */
    async updateThreeYearPlan(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.postTypHdrVar.last_updated_by = $application.user.email;
      $variables.postTypHdrVar.last_updated_login = $application.user.email;

      let p_method2 = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PUT',
        },
      });

      let encryptedPayload2 = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postTypHdrVar,
        },
      });

      const response2 = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamFiveyearplandtlProcess',
        headers: {
          'x-session-code': p_method2,
          'x-session-id': $variables.pNavId,
        },
        body: {
          payload: encryptedPayload2,
        },
      });

      if (!response2.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Three Year Plan API Error',
          displayMode: 'transient',
          type: 'error',
        });
        return;
      } else {
        if (response2.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Three Year Plan Updated Successfully',
            displayMode: 'transient',
            type: 'confirmation',
          });
          await this.createTypBudgetCost(context);
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }
      }
    }

    /**
     * @param {Object} context
     */
    async createTypBudgetCost(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      $variables.postTypCostVar.last_updated_login = $application.user.email;
      $variables.postTypCostVar.last_updated_by = $application.user.email;

      let p_line_method = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: 'PUT',
        },
      });

      let p_line_id = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postTypCostVar.fy_budget_cost_id,
        },
      });

      let encryptedLinePayload = await Actions.callChain(context, {
        chain: 'application:encryptAC',
        params: {
          input: $variables.postTypCostVar,
        },
      });

      const response4 = await Actions.callRest(context, {
        endpoint: 'PAM/postPmispamFiveyearplandtlBudgetcostProcess',
        headers: {
          'x-session-code': p_line_method,
          'x-session-id': p_line_id,
        },
        body: {
          payload: encryptedLinePayload,
        },
      });

      if (!response4.ok) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Budget Cost API Error',
          displayMode: 'transient',
          type: 'error',
        });
        return;
      } else {
        if (response4.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Budget Cost for this three year plan updated',
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response4.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }
      }
    }
  }

  return onHdrSaveAction;
});