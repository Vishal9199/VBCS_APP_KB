define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions, ActionUtils) => {
  'use strict';

  class onAboutAction extends ActionChain {
    async run(context, { event, originalEvent, key, index, current }) {
      const { $variables } = context;
      if (current && current.data) {
        $variables.about = {
          created_by: current.data.created_by || '',
          creation_date: current.data.created_date || '',
          last_updated_by: current.data.last_updated_by || '',
          last_update_date: current.data.last_updated_date || '',
          last_update_login: current.data.last_updated_login || ''
        };
      }
      await Actions.callComponentMethod(context, { selector: '#aboutDialog', method: 'open' });
    }
  }

  return onAboutAction;
});