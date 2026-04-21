define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class saveProjectlistData extends ActionChain {
    async run(context, { closeAfterSave }) {
      const { $page, $variables, $application } = context;
      try {
        document.getElementById('progressMsg').open();

        const valid = document.getElementById('projectlist_validation');
        if (valid) {
          // valid.validate();
          if ($variables.formValidVar !== 'valid') {
            document.getElementById('progressMsg').close();
            await Actions.fireNotificationEvent(context, {
              summary: 'Please fix the highlighted fields.',
              displayMode: 'transient',
              type: 'error',
            });
            return;
          }
        }

        const pNavCode  = $page.variables.pNavCode;
        const pNavId    = $page.variables.pNavId;
        const isEditMode = (pNavCode === 'EDIT');
        const httpMethod = isEditMode ? 'PUT' : 'POST';

        // if(pNavCode === 'CREATE') {
        //   $variables.projectlistHeaderVar.tender_id = $application.variables.pTenderId;
        // }

        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $variables.projectlistHeaderVar }
        });
        const enc_method = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: httpMethod }
        });

        let enc_pk;
        if (isEditMode) {
          enc_pk = pNavId;
        } else {
          enc_pk = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: { input: '0' }
          });
        }

        const response = await Actions.callRest(context, {
          endpoint: 'PDD/postPmispddProjectlistProcess',
          headers: {
            'x-session-code': enc_method,
            'x-session-id':   enc_pk
          },
          body: { payload: enc_payload }
        });

        document.getElementById('progressMsg').close();

        if (response.body && response.body.P_ERR_CODE === 'S') {
          await Actions.fireNotificationEvent(context, {
            summary: 'Success',
            message: response.body.P_ERR_MSG || (isEditMode ? 'Projectlist updated.' : 'Projectlist created.'),
            type: 'confirmation',
            displayMode: 'transient'
          });

          if (!isEditMode) {
            const newId = response.headers ? response.headers.get('x-session-id') : null;
            if (newId) {
              $page.variables.pNavCode = 'EDIT';
              $page.variables.pNavId   = newId;
            }
          }

          if (closeAfterSave) {
            await Actions.navigateBack(context, {});
          } else {
            await Actions.callChain(context, {
              chain: 'loadProjectlistData',
              params: { encryptedId: $page.variables.pNavId }
            });
          }
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: 'Error',
            message: (response.body && response.body.P_ERR_MSG) || 'Save failed.',
            type: 'error',
            displayMode: 'persist'
          });
        }
      } catch (err) {
        try { document.getElementById('progressMsg').close(); } catch (e) {}
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Save failed: ' + err.message,
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return saveProjectlistData;
});