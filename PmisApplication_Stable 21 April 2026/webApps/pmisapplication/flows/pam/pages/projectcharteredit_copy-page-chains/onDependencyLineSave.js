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

  class onDependencyLineSave extends ActionChain {

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
            message: 'Please save the Project Charter header first before adding dependencies.',
            displayMode: 'transient',
            type: 'error',
          });
          return;
        }

        // Ensure FK is always set
        $variables.dependencyVar.project_charter_id =
          $variables.projectCharterVar.project_charter_id;

        // ── MODE DETERMINATION ────────────────────────────────────────────
        const isCreateMode = $variables.isDependencyCreate === 'Y';
        const httpMethod   = isCreateMode ? 'POST' : 'PUT';
        const keyToEncrypt = isCreateMode
          ? '0'
          : String($variables.dependencyVar.dependency_id || '0');

        console.log(`🔗 ${isCreateMode ? 'CREATE' : 'UPDATE'} Dependency`);

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
        const depPayload = {
          dependency_id:        isCreateMode ? 0 : $variables.dependencyVar.dependency_id,
          object_version_num:   $variables.dependencyVar.object_version_num || 1,
          project_charter_id:   $variables.projectCharterVar.project_charter_id,
          project_dependencies: $variables.dependencyVar.project_dependencies,
          dependency_details:   $variables.dependencyVar.dependency_details,
          impacts_consequences: $variables.dependencyVar.impacts_consequences,
          additional_info:      $variables.dependencyVar.additional_info,
          created_by: isCreateMode
            ? ($application.user.email || 'CURRENT_USER')
            : $variables.dependencyVar.created_by,
          created_date:         $variables.dependencyVar.created_date || null,
          last_updated_by:      $application.user.email || 'CURRENT_USER',
          last_updated_date:    null,
          last_updated_login:   $application.user.email || 'CURRENT_USER',
        };

        console.log('📦 Dependency Payload:', JSON.stringify(depPayload, null, 2));

        // ── ENCRYPT PAYLOAD ───────────────────────────────────────────────
        const enc_payload = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: depPayload },
        });

        // ── CALL ORDS ─────────────────────────────────────────────────────
        const response = await Actions.callRest(context, {
          endpoint: 'PAM/postPmispamProjectcharterDependencyProcess',
          headers: {
            'x-session-id':   enc_session_id,
            'x-session-code': enc_method,
          },
          body: { payload: enc_payload },
        });

        console.log('📥 Dependency Save Response:', response.body);

        // ── HANDLE RESPONSE ───────────────────────────────────────────────
        if (response.body.P_ERR_CODE === 'S') {
          if (isCreateMode) {
            await this.handleCreateSuccess(context, response, isSaveAndClose);
          } else {
            await this.handleEditSuccess(context, response, isSaveAndClose);
          }
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response.body.P_ERR_MSG || 'Operation failed',
            displayMode: 'transient',
            type: 'error',
          });
        }

      } catch (error) {
        console.error('❌ onDependencyLineSave error:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Error: ' + (error.message || 'An unexpected error occurred'),
          displayMode: 'transient',
          type: 'error',
        });
      }
    }

    async handleCreateSuccess(context, response, isSaveAndClose) {
      const { $variables } = context;

      const encryptedId = this.extractHeaderValue(
        response.headers, ['X-Session-Id', 'x-session-id']
      );

      if (encryptedId) {
        console.log('✅ New Dependency encrypted ID:', encryptedId);
        $variables.dependencyVar.dependency_id = encryptedId;
        $variables.isDependencyCreate = 'N';
      } else {
        console.warn('⚠️ No encrypted ID in response headers');
      }

      await this.reloadAndHandleDialog(context, response, isSaveAndClose, 'created');
    }

    async handleEditSuccess(context, response, isSaveAndClose) {
      await Actions.callChain(context, { chain: 'loadDependencies' });

      if (isSaveAndClose === 'Y') {
        const dialog = document.getElementById('dependencyDialog');
        if (dialog) dialog.close();
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Dependency updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });
      } else {
        await this.resetFormForNewEntry(context);
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || 'Dependency updated successfully',
          displayMode: 'transient',
          type: 'confirmation',
        });
      }
    }

    async reloadAndHandleDialog(context, response, isSaveAndClose, operation) {
      await Actions.callChain(context, { chain: 'loadDependencies' });

      if (isSaveAndClose === 'Y') {
        const dialog = document.getElementById('dependencyDialog');
        if (dialog) dialog.close();
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Dependency ${operation} successfully`,
          displayMode: 'transient',
          type: 'confirmation',
        });
      } else {
        await this.resetFormForNewEntry(context);
        await Actions.fireNotificationEvent(context, {
          summary: response.body.P_ERR_MSG || `Dependency ${operation} successfully`,
          displayMode: 'transient',
          type: 'confirmation',
        });
      }
    }

    async resetFormForNewEntry(context) {
      const { $variables, $application } = context;

      await Actions.resetVariables(context, {
        variables: ['$variables.dependencyVar'],
      });

      $variables.isDependencyCreate = 'Y';
      $variables.dependencyVar.project_charter_id =
        $variables.projectCharterVar.project_charter_id;
      $variables.dependencyVar.created_by        = $application.user.email || 'CURRENT_USER';
      $variables.dependencyVar.last_updated_by   = $application.user.email || 'CURRENT_USER';
      $variables.dependencyVar.last_updated_login = $application.user.email || 'CURRENT_USER';

      console.log('✅ Dependency form reset for new entry');
    }

    extractHeaderValue(headers, headerNames) {
      if (!headers) return null;
      if (typeof headers.get === 'function') {
        for (const name of headerNames) {
          const value = headers.get(name);
          if (value) return value;
        }
      }
      for (const name of headerNames) {
        if (headers[name]) return headers[name];
      }
      return null;
    }
  }

  return onDependencyLineSave;
});