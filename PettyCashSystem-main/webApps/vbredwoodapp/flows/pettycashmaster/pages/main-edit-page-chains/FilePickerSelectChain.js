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

  class FilePickerSelectChain extends ActionChain {

    /**
     * File selection and validation action chain
     * @param {Object} context - VBCS context
     * @param {Object} params - Parameters
     * @param {object[]} params.files - Selected files array
     */
    async run(context, { files }) {
      const { $page, $application, $variables } = context;

      // Define allowed file types
      const allowedFileTypes = [
        'application/pdf',                    // PDF files
        'image/png',                          // PNG images
        'image/jpeg',                         // JPEG images
        'text/csv',                           // CSV files
        'application/vnd.ms-excel',           // Excel (.xls)
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
        'application/msword',                 // Word (.doc)
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // Word (.docx)
      ];

      const maxFileSize = 2097152; // 2MB in bytes

      try {
        // Validate file selection
        if (!files || files.length === 0) {
          await Actions.fireNotificationEvent(context, {
            summary: 'No file selected!',
            message: 'Please select a file to upload',
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }

        const selectedFile = files[0];
        console.log('📎 File selected:', {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          lastModified: new Date(selectedFile.lastModified).toISOString()
        });

        // Validate file size
        if (selectedFile.size > maxFileSize) {
          const sizeMB = (selectedFile.size / 1048576).toFixed(2);
          await Actions.fireNotificationEvent(context, {
            summary: 'File size exceeds limit!',
            message: `File size (${sizeMB}MB) exceeds 2MB limit`,
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }

        // Validate file type
        if (!allowedFileTypes.includes(selectedFile.type)) {
          await Actions.fireNotificationEvent(context, {
            summary: 'Invalid file format!',
            message: 'Allowed formats: PDF, PNG, JPEG, CSV, Excel, Word',
            type: 'error',
            displayMode: 'transient'
          });
          return;
        }

        // Get file extension
        const fileExtension = selectedFile.name.split('.').pop().toUpperCase();

        // Prepare description
        const description =  `${fileExtension} attachment for ${selectedFile.name}`;

        // Set all attachment object properties
        // CRITICAL: All fields must be set to avoid "undefined" encryption errors
        $variables.attachmentObj.P_DOCUMENT_FILE = selectedFile;
        $variables.attachmentObj.P_DOCUMENT_NAME = selectedFile.name;
        $variables.attachmentObj.P_DOCUMENT_TYPE = selectedFile.type;
        $variables.attachmentObj.P_DESCRIPTION = description;
        
        // Application code for petty cash
        $variables.attachmentObj.P_APPL_CODE = 'PETTY_CASH';
        
        // Document category
        $variables.attachmentObj.P_DOCUMENT_CATEGORY = $page.variables.docTypeVar;
        
        // Type: FILE for uploaded files (not URL or TEXT)
        $variables.attachmentObj.P_TYPE = 'FILE';
        
        // Title for the attachment
        $variables.attachmentObj.P_TITLE = selectedFile.name;
        
        // URL should be null for uploaded files
        $variables.attachmentObj.P_URL = null;
        
        // Reference type and ID
        // $variables.attachmentObj.P_REFERENCE_TYPE = 'PETTY_CASH_LINE';
        $variables.attachmentObj.P_REFERENCE_ID = null; // Will be set after line save
        
        // Created by - current user
        $variables.attachmentObj.P_CREATED_BY = $application.user.username || 'SYSTEM';
        
        // Transaction ID will be set in save_ClaimLine_AC after line creation
        // Don't set P_TRANSACTION_ID here

        // Log successful selection
        console.log('✅ Attachment object populated:', {
          file_name: $variables.attachmentObj.P_DOCUMENT_NAME,
          file_type: $variables.attachmentObj.P_DOCUMENT_TYPE,
          file_size: selectedFile.size,
          description: $variables.attachmentObj.P_DESCRIPTION,
          appl_code: $variables.attachmentObj.P_APPL_CODE,
          created_by: $variables.attachmentObj.P_CREATED_BY
        });

        // Show success notification
        await Actions.fireNotificationEvent(context, {
          summary: 'File selected successfully',
          message: `"${selectedFile.name}" ready to upload`,
          type: 'confirmation',
          displayMode: 'transient'
        });

      } catch (error) {
        console.error('❌ Error in FilePickerSelectChain:', error);
        await Actions.fireNotificationEvent(context, {
          summary: 'File selection failed',
          message: error.message || 'Please try again',
          type: 'error',
          displayMode: 'transient'
        });
      }
    }
  }

  return FilePickerSelectChain;
});