define([], () => {
  'use strict';

  class PageModule {

    handleValidationError(validationGroupId) {
      const vg = document.getElementById(validationGroupId);

      if (vg) {
        if (vg.valid === "invalidHidden") {
          vg.showMessages(); // show hidden errors
        }
        if (vg.valid !== "valid") {
          vg.focusOn("@firstInvalidShown"); // focus first invalid field
        }
      }
    }

    /**
     * Get file size limit in bytes
     * @param {string} limitType - '2MB', '5MB', or '10MB'
     * @return {number} Size limit in bytes
     */
    getFileSizeLimit(limitType = '2MB') {
      const limits = {
        '2MB': 2 * 1024 * 1024,   // 2,097,152 bytes
        '5MB': 5 * 1024 * 1024,   // 5,242,880 bytes
        '10MB': 10 * 1024 * 1024  // 10,485,760 bytes
      };

      return limits[limitType] || limits['2MB'];
    }

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @return {string} Formatted size string
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Validate file type - blocks dangerous and unwanted file types
     * @param {string} fileName - Name of the file
     * @param {string} fileType - MIME type of the file
     * @return {object} Validation result with isValid and message
     */
    validateFileType(fileName, fileType) {
      // Get file extension
      const extension = fileName.toLowerCase().split('.').pop();

      // Blocked extensions (security risks and unwanted types)
      const blockedExtensions = [
        // Archive files
        'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
        // Executable files
        'exe', 'bat', 'cmd', 'com', 'scr', 'msi', 'dll',
        // Script files
        'js', 'vbs', 'ps1', 'sh', 'py', 'pl', 'rb',
        // System files
        'sys', 'ini', 'cfg', 'reg',
        // Potentially dangerous
        'jar', 'class', 'dex', 'apk',

        'xml', 'json', 'sql'
      ];

      // Blocked MIME types
      const blockedMimeTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program'
      ];

      // Check blocked extensions
      if (blockedExtensions.includes(extension)) {
        return {
          isValid: false,
          message: `File type .${extension} is not allowed for security reasons`
        };
      }

      // Check blocked MIME types
      if (blockedMimeTypes.includes(fileType)) {
        return {
          isValid: false,
          message: `File type ${fileType} is not allowed for security reasons`
        };
      }

      // Allowed file types (whitelist approach - more secure)
      const allowedExtensions = [
        // Documents
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
        // Other common types
        'csv'
      ];

      if (!allowedExtensions.includes(extension)) {
        return {
          isValid: false,
          message: `File type .${extension} is not supported. Allowed types: ${allowedExtensions.join(', ')}`
        };
      }

      return {
        isValid: true,
        message: 'File type is valid'
      };
    }

    /**
     * Comprehensive file validation
     * @param {File} file - File object to validate
     * @param {string} sizeLimit - Size limit ('2MB', '5MB', '10MB')
     * @return {object} Complete validation result
     */
    validateFile(file, sizeLimit = '2MB') {
      const result = {
        isValid: true,
        messages: [],
        fileInfo: {
          name: file.name,
          size: this.formatFileSize(file.size),
          type: file.type,
          sizeInBytes: file.size
        }
      };

      // Size validation
      const maxSize = this.getFileSizeLimit(sizeLimit);
      if (file.size > maxSize) {
        result.isValid = false;
        result.messages.push(`File size ${this.formatFileSize(file.size)} exceeds the ${sizeLimit} limit`);
      }

      // Type validation
      const typeValidation = this.validateFileType(file.name, file.type);
      if (!typeValidation.isValid) {
        result.isValid = false;
        result.messages.push(typeValidation.message);
      }

      return result;
    }

    downloadFile(base64String, name, type) {
      let applicationType = "data:" + type + ";base64,";
      let finalContent = applicationType + base64String;
      const downloadLink = document.createElement('a');
      document.body.appendChild(downloadLink);
      downloadLink.href = finalContent;
      downloadLink.download = name;
      downloadLink.click();
    }

  }

  return PageModule;
});
