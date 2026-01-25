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

  class loadHeaderAC extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $page, $flow, $application, $constants, $variables } = context;

      try {
        console.log("=== Loading Template Header ===");
        console.log("Template ID:", $variables.key);

        // Prepare search object for template
        const templateSearchObj = {
          IN_LIMIT: 1,
          IN_OFFSET: 0,
          P_TEMPLATE_ID: +$variables.key // ✅ Convert to number
        };

        console.log("Search object:", JSON.stringify(templateSearchObj, null, 2));

        // Encrypt the payload
        const encryptedTemplatePayload = await $application.functions.encryptJs(
          $application.constants.secretKey, 
          templateSearchObj
        );

        $variables.encryptedBody.payload = encryptedTemplatePayload;

        console.log("🔐 Payload encrypted");
        console.log("🌐 Calling REST endpoint: postEmailSearch");

        // Call REST to get template details
        const templateResponse = await Actions.callRest(context, {
          endpoint: 'Application/postEmailSearch',
          body: $variables.encryptedBody,
        });

        console.log("Response:", JSON.stringify(templateResponse.body, null, 2));

        if (templateResponse?.body.OUT_STATUS === "SUCCESS" && 
            templateResponse.body.OUT_COUNT > 0) {
          
          // Populate template variable with fetched data
          $variables.emailTemplateVar = templateResponse.body.P_OUTPUT[0];
          
          console.log("✓ Template loaded successfully");
          console.log("Template Name:", $variables.emailTemplateVar.template_name);
          console.log("Template Code:", $variables.emailTemplateVar.template_code);

        } else {
          // Template not found or error
          console.error("✗ Template not found or error");
          console.error("Status:", templateResponse?.body.OUT_STATUS);
          console.error("Description:", templateResponse?.body.OUT_DESCRIPTION);

          await Actions.fireNotificationEvent(context, {
            summary: 'Template Not Found',
            message: templateResponse?.body.OUT_DESCRIPTION || 'Failed to load template details',
            type: 'error',
            displayMode: 'transient'
          });

          // Navigate back to search page
          await Actions.navigateBack(context);
        }

      } catch (error) {
        console.error("✗ Error loading template:", error);
        
        await Actions.fireNotificationEvent(context, {
          summary: 'Error',
          message: 'Failed to load template details: ' + error.message,
          type: 'error',
          displayMode: 'transient'
        });

        await Actions.navigateBack(context);
      }
    }
  }

  return loadHeaderAC;
});