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

  class toYearValueItem extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {object} params.event
     * @param {any} params.previousValue
     * @param {any} params.value
     * @param {string} params.updatedFrom
     * @param {any} params.key
     * @param {any} params.data
     * @param {any} params.metadata
     * @param {any} params.valueItem
     */
    async run(context, { event, previousValue, value, updatedFrom, key, data, metadata, valueItem }) {
      const { $page, $flow, $application, $constants, $variables } = context;

      if (value.key !== null && $variables.calendarLineVar.from_year !== null) {

        $variables.calendarLineVar.prompt = ($variables.calendarLineVar.from_year ? $variables.calendarLineVar.from_year : '') + '-' + ($variables.calendarLineVar.to_year ? $variables.calendarLineVar.to_year : '');

        if (+value.key < +$variables.calendarLineVar.from_year) {
          await Actions.fireNotificationEvent(context, {
            summary: 'To-Year must be greater than the from-year.',
            displayMode: 'transient',
            type: 'warning',
          });

          await Actions.resetVariables(context, {
            variables: [
    '$variables.calendarLineVar.to_year',
  ],
          });
        }
      }
    }
  }

  return toYearValueItem;
});