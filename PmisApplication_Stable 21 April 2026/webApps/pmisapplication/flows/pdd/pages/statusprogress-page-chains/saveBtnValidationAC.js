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

  class saveBtnValidationAC extends ActionChain {

    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // ===================== FORM VALIDATION =====================
      const v = $variables.getStatusprogressbyperiodVar;

      const validationErrors = [];

      if (!v.physical_planned_perc || String(v.physical_planned_perc).trim() === '') {
        validationErrors.push('Planned %(Cumulative) is required.');
      }
      if (!v.actual_completed_perc || String(v.actual_completed_perc).trim() === '') {
        validationErrors.push('Actual %(Cumulative) is required.');
      }
      if (!v.period_summary || String(v.period_summary).trim() === '') {
        validationErrors.push('Period Summary is required.');
      }
      if (!v.work_planned || String(v.work_planned).trim() === '') {
        validationErrors.push('Work Planned is required.');
      }
      if (!v.work_performed || String(v.work_performed).trim() === '') {
        validationErrors.push('Work Performed is required.');
      }
      if (!v.actual_items || String(v.actual_items).trim() === '') {
        validationErrors.push('Action Items is required.');
      }

      if (validationErrors.length > 0) {
        await Actions.fireNotificationEvent(context, {
          summary: 'Validation Failed',
          message: validationErrors.join(' | '),
          type: 'error',
          displayMode: 'persist',
        });
        return; // stop execution
      }
      // ===========================================================

      if ($variables.pNavCode === 'CREATE') {

        const response3 = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddGeneralProjecttenderGetbyid',
          headers: {
            'x-session-id': $variables.pTenderId,
          },
        });

        $variables.getStatusprogressbyperiodVar.ora_project_name   = $variables.headerInfoVar.projectName;
        $variables.getStatusprogressbyperiodVar.ora_project_number = $variables.headerInfoVar.projectNumber;
        $variables.getStatusprogressbyperiodVar.tender_number      = $variables.headerInfoVar.tenderNumber;
        $variables.getStatusprogressbyperiodVar.ora_project_id     = response3.body.items[0].project_id;
        $variables.getStatusprogressbyperiodVar.tender_id          = response3.body.items[0].tender_id;
        $variables.getStatusprogressbyperiodVar.period             = $variables.periodName;
        $variables.getStatusprogressbyperiodVar.last_updated_by    = $application.user.email;
        $variables.getStatusprogressbyperiodVar.last_updated_login = $application.user.email;
        $variables.getStatusprogressbyperiodVar.created_by         = $application.user.email;
        $variables.getStatusprogressbyperiodVar.progress_id        = 0;
        $variables.getStatusprogressbyperiodVar.object_version_num = 0;
        $variables.getStatusprogressbyperiodVar.created_date       = $application.functions.getSysdate();
        $variables.getStatusprogressbyperiodVar.last_updated_date  = $application.functions.getSysdate();

        let enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'POST' },
        });

        let enc_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: '0' },
        });

        let enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.getStatusprogressbyperiodVar },
        });

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddStatusprogressProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id':   enc_key,
          },
          body: { payload: enc_payload },
        });

        if (response.body.P_ERR_CODE === 'S') {
          $variables.pNavEncId =
            response.headers.get('X-Session-Id') ||
            response.headers.get('x-session-id') ||
            response.headers.get('X-session-id');
          $variables.pNavCode = 'EDIT';
          $variables.pNavId   = $variables.pNavEncId;

          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            type: 'confirmation',
            displayMode: 'transient',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG,
            type: 'error',
            displayMode: 'persist',
          });
        }

      } else {

        $variables.getStatusprogressbyperiodVar.last_updated_by    = $application.user.email;
        $variables.getStatusprogressbyperiodVar.last_updated_login = $application.user.email;
        $variables.getStatusprogressbyperiodVar.last_updated_date  = $application.functions.getSysdate();

        let enc_put_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'PUT' },
        });

        let enc_p_key = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.pNavId },
        });

        let enc_put_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.getStatusprogressbyperiodVar },
        });

        const response2 = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddStatusprogressProcess',
          headers: {
            'x-session-code': enc_put_method,
            'x-session-id':   enc_p_key,
          },
          body: { payload: enc_put_payload },
        });

        if (response2.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            type: 'confirmation',
            displayMode: 'transient',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            type: 'error',
            displayMode: 'persist',
          });
        }
      }
    }
  }

  return saveBtnValidationAC;
});