define([], () => {
  'use strict';

  class PageModule {

    getFileSizeLimit(limitType = '2MB') {
      const limits = {
        '2MB': 2 * 1024 * 1024,
        '5MB': 5 * 1024 * 1024,
        '10MB': 10 * 1024 * 1024
      };
      return limits[limitType] || limits['2MB'];
    }

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    validateFileType(fileName, fileType) {
      const extension = fileName.toLowerCase().split('.').pop();

      const blockedExtensions = [
        'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
        'exe', 'bat', 'cmd', 'com', 'scr', 'msi', 'dll',
        'js', 'vbs', 'ps1', 'sh', 'py', 'pl', 'rb',
        'sys', 'ini', 'cfg', 'reg',
        'jar', 'class', 'dex', 'apk'
      ];

      const blockedMimeTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-executable',
        'application/x-msdownload',
        'application/x-msdos-program'
      ];

      if (blockedExtensions.includes(extension)) {
        return { isValid: false, message: `File type .${extension} is not allowed for security reasons` };
      }

      if (blockedMimeTypes.includes(fileType)) {
        return { isValid: false, message: `File type ${fileType} is not allowed for security reasons` };
      }

      const allowedExtensions = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',
        'csv', 'xml', 'json', 'sql'
      ];

      if (!allowedExtensions.includes(extension)) {
        return {
          isValid: false,
          message: `File type .${extension} is not supported. Allowed types: ${allowedExtensions.join(', ')}`
        };
      }

      return { isValid: true, message: 'File type is valid' };
    }

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

      const maxSize = this.getFileSizeLimit(sizeLimit);
      if (file.size > maxSize) {
        result.isValid = false;
        result.messages.push(`File size ${this.formatFileSize(file.size)} exceeds the ${sizeLimit} limit`);
      }

      const typeValidation = this.validateFileType(file.name, file.type);
      if (!typeValidation.isValid) {
        result.isValid = false;
        result.messages.push(typeValidation.message);
      }

      return result;
    }

    convertFileToBase64(file, format = 'raw') {
      return new Promise((resolve, reject) => {
        if (!file || !(file instanceof File)) {
          return reject(new Error('Invalid file object'));
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const raw = dataUrl.split(',')[1];
          resolve(format === 'dataurl' ? dataUrl : raw);
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    }

    downloadFileFromBase64(base64String, name, type) {
      const applicationType = `data:${type};base64,`;
      const finalContent = applicationType + base64String;

      const downloadLink = document.createElement('a');
      document.body.appendChild(downloadLink);
      downloadLink.href = finalContent;
      downloadLink.download = name;
      downloadLink.click();

      // Cleanup
      document.body.removeChild(downloadLink);
    };
  }

  return PageModule;
});