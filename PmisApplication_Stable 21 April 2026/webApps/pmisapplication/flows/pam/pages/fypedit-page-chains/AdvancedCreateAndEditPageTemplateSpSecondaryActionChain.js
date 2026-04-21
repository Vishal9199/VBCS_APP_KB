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

  class AdvancedCreateAndEditPageTemplateSpSecondaryActionChain extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {string} params.secondaryItem
     * @param {string} params.actionId
     */
    async run(context, { event, secondaryItem, actionId }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      switch (secondaryItem) {
        case 'save': {
          await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });
          break;
        }
        case 'saveclose': {
          await Actions.callChain(context, {
            chain: 'onHdrSaveAction',
          });

          await Actions.navigateBack(context, {
          });
          break;
        }
        case 'attachment': {
        let temp_hdr_id = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: {
            input: $variables.postFypHdrVar.fy_plan_id,
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
              'P_SCREEN_NAME': 'Five Year Plan',
            },
          });
        }
          break;
        default:
          break;
      }
    }
  }

  return AdvancedCreateAndEditPageTemplateSpSecondaryActionChain;
});
