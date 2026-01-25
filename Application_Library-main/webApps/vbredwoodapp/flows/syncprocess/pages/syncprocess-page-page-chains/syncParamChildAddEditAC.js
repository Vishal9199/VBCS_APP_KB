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

  class syncParamChildAddEditAC extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.method 
     */
    async run(context, { method }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      // 🔍 SUPER DEBUG: Check validation status FIRST
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║         VALIDATION DEBUG - DETAILED ANALYSIS           ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      
      console.log('\n📊 STEP 1: Check isValueFormValid variable');
      console.log('   isValueFormValid:', $variables.isValueFormValid);
      
      console.log('\n📊 STEP 2: Check Form Data');
      console.log('   ScheduleSyncParamSearchVar:', JSON.stringify($variables.ScheduleSyncParamSearchVar, null, 2));
      
      // Get validation group element
      const formElement = document.getElementById('scheduleParameter');
      
      if (formElement) {
        console.log('\n📊 STEP 3: Validation Group Found');
        console.log('   ID: scheduleParameter');
        console.log('   Valid Status:', formElement.valid);
        
        // Get all form inputs
        const allInputs = formElement.querySelectorAll(
          'oj-input-text, oj-input-number, oj-input-date, oj-select-single, oj-text-area, oj-switch, oj-checkboxset, oj-radioset'
        );
        
        console.log('\n📊 STEP 4: Analyzing', allInputs.length, 'Form Fields');
        console.log('   ┌─────────────────────────────────────────────────────┐');
        
        let invalidFields = [];
        
        allInputs.forEach((input, index) => {
          const id = input.id || `unnamed-field-${index}`;
          const labelHint = input.getAttribute('label-hint') || 'No Label';
          const valid = input.valid;
          const value = input.value;
          const required = input.required || input.hasAttribute('required');
          const disabled = input.disabled || input.hasAttribute('disabled');
          
          const status = valid === 'valid' ? '✅' : '❌';
          
          console.log(`   ${status} Field #${index + 1}`);
          console.log(`      ID: ${id}`);
          console.log(`      Label: ${labelHint}`);
          console.log(`      Valid: ${valid}`);
          console.log(`      Value: ${JSON.stringify(value)}`);
          console.log(`      Required: ${required}`);
          console.log(`      Disabled: ${disabled}`);
          console.log('      ───────────────────────────────────────────');
          
          if (valid !== 'valid' && !disabled) {
            invalidFields.push({
              id: id,
              label: labelHint,
              valid: valid,
              value: value
            });
          }
        });
        
        console.log('   └─────────────────────────────────────────────────────┘');
        
        if (invalidFields.length > 0) {
          console.log('\n❌ INVALID FIELDS FOUND:', invalidFields.length);
          console.log('   Problem Fields:');
          invalidFields.forEach((field, idx) => {
            console.log(`   ${idx + 1}. ${field.label} (ID: ${field.id})`);
            console.log(`      Status: ${field.valid}`);
            console.log(`      Value: ${JSON.stringify(field.value)}`);
          });
        } else {
          console.log('\n✅ ALL FIELDS ARE VALID');
          console.log('   But isValueFormValid variable says:', $variables.isValueFormValid);
          console.log('   🔴 POTENTIAL ISSUE: Variable binding problem!');
        }
      } else {
        console.log('\n❌ ERROR: Validation Group NOT FOUND!');
        console.log('   Looking for: #scheduleParameter');
        console.log('   🔴 Check your HTML - validation-group id might be wrong');
      }
      
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║                    END DEBUG                           ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');

      if ($variables.isValueFormValid === "valid") {
        const headerCode = await $application.functions.encryptJs($application.constants.secretKey, method);
        const headerId = await $application.functions.encryptJs($application.constants.secretKey, $variables.ScheduleSyncParamSearchVar.param_id);

        if (method === "POST") {
          $variables.ScheduleSyncParamSearchVar.created_by = $application.user.fullName;
          $variables.ScheduleSyncParamSearchVar.created_date = await $application.functions.getSysdate();
          $variables.ScheduleSyncParamSearchVar.schedule_id = $variables.scheduled_id;
        }
        $variables.ScheduleSyncParamSearchVar.last_updated_by = $application.user.fullName;
        $variables.ScheduleSyncParamSearchVar.last_updated_date = await $application.functions.getSysdate();
        $variables.ScheduleSyncParamSearchVar.last_updated_login = $application.user.fullName;
        
        $variables.ScheduleSyncParamSearchVar.next_schedule_time_temp = await $application.functions.formatDateForDB($variables.ScheduleSyncParamSearchVar.next_schedule_time_temp);
        $variables.ScheduleSyncParamSearchVar.next_schedule_time = await $application.functions.getSysdate();

        $variables.encryptedBody.payload = await $application.functions.encryptJs($application.constants.secretKey, $variables.ScheduleSyncParamSearchVar);

        const response2 = await Actions.callRest(context, {
          endpoint: 'ScheduleProcess/postStgScheduleSyncParamProcess',
          headers: {
            'X-cache-code': headerCode,
            'X-cache-id': headerId,
          },
          body: $variables.encryptedBody,
        });

        if (response2?.body?.P_ERR_CODE === 'S') {

          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'confirmation',
          });

          return "S";
          
        } else {
          await Actions.fireNotificationEvent(context, {
            summary: response2.body.P_ERR_MSG,
            displayMode: 'transient',
            type: 'error',
          });
        }

      } else {
        // Show validation messages
        await Actions.callComponentMethod(context, {
          selector: '#scheduleParameter',
          method: 'showMessages',
        });

        // Focus on first invalid field
        await Actions.callComponentMethod(context, {
          selector: '#scheduleParameter',
          method: 'focusOn',
          params: ['@firstInvalidShown'],
        });

        // Warn user
        await Actions.fireNotificationEvent(context, {
          summary: "Please fix the highlighted errors before saving.",
          displayMode: "transient",
          type: "warning",
        });
      }

      return "E";
    }
  }

  return syncParamChildAddEditAC;
});