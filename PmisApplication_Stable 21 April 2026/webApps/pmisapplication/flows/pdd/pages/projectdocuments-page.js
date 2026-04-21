define([], () => {
  'use strict';

  class PageModule {
    splitArrayByType(dataArray, filterType) {
      // Input validation
      if (!Array.isArray(dataArray)) {
        console.warn('splitArrayByType: Input is not an array');
        return filterType ? [] : { fileArray: [], urlArray: [], textArray: [] };
      }

      // Initialize arrays
      const fileArray = [];
      const urlArray = [];
      const textArray = [];

      // Group items by type
      dataArray.forEach(item => {
        if (item && item.type) {
          switch (item.type.toUpperCase()) {
            case 'FILE':
              fileArray.push(item);
              break;
            case 'URL':
              urlArray.push(item);
              break;
            case 'TEXT':
              textArray.push(item);
              break;
            default:
              console.warn(`Unknown type: ${item.type} for document_id: ${item.document_id}`);
          }
        }
      });

      // Return specific type if requested
      if (filterType) {
        switch (filterType.toUpperCase()) {
          case 'FILE':
            return fileArray;
          case 'URL':
            return urlArray;
          case 'TEXT':
            return textArray;
          default:
            console.warn(`Invalid filterType: ${filterType}. Valid types: FILE, URL, TEXT`);
            return [];
        }
      }

      // Return all three arrays
      return {
        fileArray: fileArray,
        urlArray: urlArray,
        textArray: textArray,
        counts: {
          files: fileArray.length,
          urls: urlArray.length,
          texts: textArray.length,
          total: fileArray.length + urlArray.length + textArray.length
        }
      };
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
        'jar', 'class', 'dex', 'apk'
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
        'csv', 'xml', 'json', 'sql'
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

    formatText(text) {
      return text
        .split('_')                           // Split by underscore
        .map(word =>
          word.charAt(0).toUpperCase() +      // Capitalize first letter
          word.slice(1).toLowerCase()         // Lowercase rest
        )
        .join(' ');                           // Join with space
    }

    convertFileToBase64(file, format = 'raw') {
      return new Promise((resolve, reject) => {
        if (!file || !(file instanceof File)) {
          return reject(new Error('Invalid file object'));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          const dataUrl = e.target.result;       // data:<mime>;base64,<data>
          const raw = dataUrl.split(',')[1];      // plain base64 only
          resolve(format === 'dataurl' ? dataUrl : raw);
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    }

    /**
     * Convert a Base64 string back to a Blob / File
     * @param {string} base64 - Raw base64 or data URL string
     * @param {string} fileName - Desired output filename
     * @param {string} mimeType - MIME type (auto-detected from data URL if omitted)
     * @return {File} Reconstructed File object
     */
    convertBase64ToFile(base64, fileName = 'output', mimeType = 'application/octet-stream') {
      let b64 = base64, mime = mimeType;

      if (base64.startsWith('data:')) {
        const parts = base64.match(/^data:([^;]+);base64,(.+)$/);
        if (!parts) throw new Error('Invalid data URL');
        [, mime, b64] = parts;
      }

      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      return new File([bytes], fileName, { type: mime });
    }
  }

  return PageModule;
});
