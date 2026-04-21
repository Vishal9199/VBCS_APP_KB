define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class saveQualityAssuranceChain extends ActionChain {
    async run(context) {
      const { $page, $flow, $application, $variables } = context;

      try {
        document.getElementById('progressDialog').open();

        // Get only modified (submittable) rows from BufferingDataProvider
        const submittableItems = await $page.variables.qaBufferDP.instance.getSubmittableItems();
        const updatedItems = submittableItems.filter(obj => obj.operation === 'update');

        if (!updatedItems || updatedItems.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No changes to save',
            displayMode: 'transient',
            type: 'warning',
          });
          return;
        }

        console.log('Quality Assurance: saving ' + updatedItems.length + ' changed record(s)');

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < updatedItems.length; i++) {
          const record = updatedItems[i].item.data;
          const rowKey = updatedItems[i].item.metadata.key;

          console.log('Saving record ' + (i + 1) + ', ID: ' + record.quality_assurance_id);

          try {
            const encryptedId = await Actions.callChain(context, {
              chain: 'application:encryptAC',
              params: { input: String(record.quality_assurance_id) },
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
              endpoint: 'PDD/postPmispddQualitycontrolQualityassureProcess',
              body: { payload: encryptedPayload },
              headers: {
                'x-session-id': encryptedId,
                'x-session-code': encryptedMethod,
              },
            });

            if (saveResponse.ok) {
              console.log('Record ' + (i + 1) + ' saved OK');
              $page.variables.qaBufferDP.instance.setItemStatus(updatedItems[i], 'submitted');
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
          params: { input: 'QUALITY_ASSURANCE' },
        });

        const dataResponse = await Actions.callRest(context, {
          endpoint: 'PDD/getPmispddQualitycontrolCommonGetbyid',
          headers: {
            'p-tender-id': $application.variables.pTenderId,
            'p-period': encryptedPeriod,
            'p-type': encryptedType,
          },
        });

        console.log('Quality Assurance reloaded:', JSON.stringify(dataResponse.body.OUTPUT));

        // CORRECT VBCS pattern: direct assignment to ADP.data
        $variables.qualityAssuranceADP.data = dataResponse.body.OUTPUT || [];

        // Reset BufferingDP after reload
        await $page.variables.qaBufferDP.instance.resetAllUnsubmittedItems();

        if (failCount === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'All Quality Assurance records saved successfully (' + successCount + ' records)',
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
        console.error('Error saving Quality Assurance data:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'Failed to save Quality Assurance data',
          displayMode: 'persist',
          type: 'error',
        });
      } finally {
        document.getElementById('progressDialog').close();
      }
    }
  }

  return saveQualityAssuranceChain;
});