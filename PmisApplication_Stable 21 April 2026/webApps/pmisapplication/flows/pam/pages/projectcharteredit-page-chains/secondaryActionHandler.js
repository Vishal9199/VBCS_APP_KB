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

  class secondaryActionHandler extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {any} params.actionId
     * @param {string} params.secondaryItem
     * @param {string} params.event
     */
    async run(context, { actionId, secondaryItem, event }) {
      const { $page, $variables, $constants, $application, $flow } = context;

      console.log("Secondary action clicked:", actionId);

      // Route to appropriate action chain based on button clicked
      if (secondaryItem === 'submit') {
        // await Actions.callChain(context, {
        //   chain: 'submitChain',
        // });
      } else if (secondaryItem === 'print') {
        await Actions.callChain(context, {
          chain: 'printChain',
        });
      } else if ( secondaryItem === 'save' ) {
        await Actions.callChain(context, {
          chain: 'saveAndCloseChain',
          params: {
            isSaveAndNavigate: 'N',
          },
        });
      } else if ( secondaryItem === 'saveClose' ) {
        await Actions.callChain(context, {
          chain: 'saveAndCloseChain',
          params: {
            isSaveAndNavigate: 'Y',
          },
        });
      } else if (secondaryItem === 'export') {
        await Actions.callChain(context, {
          chain: 'exportChain',
        });
      } else if ( secondaryItem === 'attachment' ) {
        let temp_hdr_id = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $variables.projectCharterVar.project_charter_id,
            },
          });

          let enc_applCode = await Actions.callChain(context, {
            chain: 'application:encryptAC',
            params: {
              input: $constants.stored_Appl_Code,
            },
          });
          const toCommonmodules = await Actions.navigateToFlow(context, {
            flow: 'commonmodules',
            target: 'parent',
            page: 'attachment',
            params: {
              'P_APPLICATION_CODE': enc_applCode,
              'P_TRANSACTION_ID': temp_hdr_id,
              'P_SCREEN_NAME': 'Project Charter',
            },
          });
      } else if (secondaryItem === 'about') {
        $variables.about.created_by = $variables.projectCharterVar.created_by;
        $variables.about.created_date = $variables.projectCharterVar.created_date;
        $variables.about.last_updated_by = $variables.projectCharterVar.last_updated_by;
        $variables.about.last_updated_date = $variables.projectCharterVar.last_updated_date;
        $variables.about.last_updated_login = $variables.projectCharterVar.last_updated_login;

        const aboutDialogOpen = await Actions.callComponentMethod(context, {
          selector: '#aboutDialog',
          method: 'open',
        });

      } else {
      }
    }
  }

  return secondaryActionHandler;
});