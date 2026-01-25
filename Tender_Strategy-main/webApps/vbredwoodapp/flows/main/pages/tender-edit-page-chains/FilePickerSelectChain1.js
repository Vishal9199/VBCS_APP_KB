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

  class FilePickerSelectChain1 extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {object[]} params.files
     * @param {any} params.originalEvent
     */
    async run(context, { files }) {
      const { $page, $flow, $application, $functions, $variables, $constants } = context;

      try {
        if (!files || files.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No File Selected',
            message: 'Please select a file to upload',
            type: 'warning',
            displayMode: 'transient'
          });
          return;
        }

        const selectedFile = files[0];

        // Set your desired size limit here: '2MB', '5MB', or '10MB'
        const SIZE_LIMIT = '2MB';

        // Comprehensive file validation
        const validationResult = $functions.validateFile(selectedFile, SIZE_LIMIT);

        if (validationResult.isValid) {

          const newFile = {
            document_file: selectedFile,
            document_name: selectedFile.name,
            document_type: selectedFile.type
          };

          $variables.filesArray.push(newFile);
        }
        else {
          // File validation failed
          const errorMessage = validationResult.messages.join('. ');

          await Actions.fireNotificationEvent(context, {
            summary: 'File Validation Failed',
            message: errorMessage,
            type: 'error',
            displayMode: 'persist'
          });
        }

      } catch (error) {
        console.error('File validation error:', error);

        await Actions.fireNotificationEvent(context, {
          summary: 'File Processing Error',
          message: 'An error occurred while processing the selected file',
          type: 'error',
          displayMode: 'persist'
        });
      }
    }
  }

  return FilePickerSelectChain1;
});
