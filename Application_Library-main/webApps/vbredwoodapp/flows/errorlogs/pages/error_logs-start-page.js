define([], () => {
  'use strict';

  class PageModule {
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy to clipboard
     * @returns {Promise} - Resolves with success object or rejects with error
     */
    copyToClipboard(text) {
      return new Promise((resolve, reject) => {
        try {
          console.log('copyToClipboard: Starting copy operation');
          console.log('copyToClipboard: Text to copy:', text);
          
          // Validate input
          if (!text || text.trim() === '') {
            console.error('copyToClipboard: No text provided');
            reject({
              success: false,
              message: 'No text to copy'
            });
            return;
          }

          // Create temporary textarea element
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.top = '0';
          textarea.style.left = '0';
          textarea.style.opacity = '0';
          textarea.style.pointerEvents = 'none';
          
          document.body.appendChild(textarea);
          
          // Select and copy
          textarea.focus();
          textarea.select();
          textarea.setSelectionRange(0, textarea.value.length); // For mobile devices
          
          const successful = document.execCommand('copy');
          
          // Clean up
          document.body.removeChild(textarea);
          
          if (successful) {
            console.log('copyToClipboard: Copy successful');
            resolve({
              success: true,
              message: 'Query copied to clipboard successfully!'
            });
          } else {
            console.error('copyToClipboard: Copy command failed');
            reject({
              success: false,
              message: 'Failed to copy query to clipboard'
            });
          }
          
        } catch (error) {
          console.error('copyToClipboard: Error occurred:', error);
          reject({
            success: false,
            message: 'Error copying to clipboard: ' + error.message
          });
        }
      });
    }
  }
  
  return PageModule;
});