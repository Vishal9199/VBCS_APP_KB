define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class saveQualityControlChain extends ActionChain {
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      try {
        document.getElementById('progressDialog').open();

        // Get only modified (submittable) rows from BufferingDataProvider
        const submittableItems = await $page.variables.qcBufferDP.instance.getSubmittableItems();
        const updatedItems = submittableItems.filter(obj => obj.operation === 'update');

        if (!updatedItems || updatedItems.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No changes to save',
            displayMode: 'transient',
            type: 'warning',
          });
          return;
        }

        console.log('Quality Control: saving ' + updatedItems.length + ' changed record(s)');

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < updatedItems.length; i++) {
          const record = updatedItems[i].item.data;
          const rowKey = updatedItems[i].item.metadata.key;

          console.log('Saving record ' + (i + 1) + ', ID: ' + record.quality_control_id);

          try {
            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(record.quality_control_id) },
            });

            const encryptedMethod = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: 'PUT' },
            });

            const encryptedPayload = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: JSON.stringify(record) },
            });

            const saveResponse = await Actions.callRest(context, {
              endpoint: 'PDD/postPmispddQualitycontrolQualitycontrolProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-id': encryptedId,
                'x-session-code': encryptedMethod,
              },
            });

            if (saveResponse.ok) {
              console.log('Record ' + (i + 1) + ' saved OK');
              $page.variables.qcBufferDP.instance.setItemStatus(updatedItems[i], 'submitted');
              successCount++;
            } else {
              console.error('Record ' + (i + 1) + ' save failed');
              failCount++;
            }
          } catch (recordError) {
            console.error('Error saving record ' + (i + 1) + ':', recordError);
            failCount++;
          }
        }

        // Reload fresh data — CORRECT VBCS pattern: direct ADP.data assignment
        const encryptedPeriod = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: $application.variables.pPeriod || 'FEB-26' },
        });

        const encryptedType = await Actions.callChain(context, {
          chain: 'application:encryptAC',
          params: { input: 'QUALITY_CONTROL' },
        });

        const dataResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddQualitycontrolCommonGetbyid',
          headers: {
            'p-tender-id': $application.variables.pTenderId,
            'p-period': encryptedPeriod,
            'p-type': encryptedType,
          },
        });

        console.log('Quality Control reloaded:', JSON.stringify(dataResponse.body.OUTPUT));

        // CORRECT VBCS pattern: direct assignment to ADP.data
        $variables.qualityControlADP.data = dataResponse.body.OUTPUT || [];

        // Reset BufferingDP after reload
        await $page.variables.qcBufferDP.instance.resetAllUnsubmittedItems();

        if (failCount === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'All Quality Control records saved successfully (' + successCount + ' records)',
            displayMode: 'transient',
            type: 'confirmation',
          });
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: successCount + ' records saved, ' + failCount + ' failed',
            displayMode: 'persist',
            type: 'warning',
          });
        }

      } catch (error) {
        console.error('Error saving Quality Control data:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to save Quality Control data',
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return saveQualityControlChain;
});