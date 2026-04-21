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

  class primaryActionListener extends ActionChain {

    async run(context) {
      try {
        console.log('Closing page...');

        await Actions.navigateBack(context, {
        });
        
      } catch (error) {
        console.error('primaryActionListener error:', error);
      }
    }
  }

  return primaryActionListener;
});