define([], () => {
  'use strict';

  class PageModule {

    buildBudgetColumns(year) {
      const currYear = year ? String(year) : '';
      const nextYear = year ? String(parseInt(year) + 1) : '';

      const headerStyle =
        'white-space:nowrap;' +
        'background-color:#084c4c;' +
        'color:#ffffff;' +
        'font-weight:600;' +
        'font-size:0.8rem;' +
        'padding:6px 4px;';

      const disabledHeaderStyle = headerStyle +
        'background-color: #084c4c;';   // slightly lighter for distinction

      return [
        {
          headerText: 'Meaning',
          field: 'meaning',
          frozenEdge: 'start',
          template: 'MeaningTpl',
          headerStyle: disabledHeaderStyle,
          width: 240,
          resizable: 'enabled'
        },
        {
          headerText: 'Prior Year',
          field: 'prior_years',
          frozenEdge: 'start',
          style: 'text-align: right',
          template: 'PriorYearTpl',
          headerStyle: disabledHeaderStyle,
          width: 110
        },
        {
          headerText: currYear ? 'Jan-' + currYear : 'January',
          field: 'january',
          style: 'text-align: right',
          template: 'JanTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Feb-' + currYear : 'February',
          field: 'february',
          style: 'text-align: right',
          template: 'FebTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Mar-' + currYear : 'March',
          field: 'march',
          style: 'text-align: right',
          template: 'MarTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Apr-' + currYear : 'April',
          field: 'april',
          style: 'text-align: right',
          template: 'AprTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'May-' + currYear : 'May',
          field: 'may',
          style: 'text-align: right',
          template: 'MayTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Jun-' + currYear : 'June',
          field: 'june',
          style: 'text-align: right',
          template: 'JunTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Jul-' + currYear : 'July',
          field: 'july',
          style: 'text-align: right',
          template: 'JulTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Aug-' + currYear : 'August',
          field: 'august',
          style: 'text-align: right',
          template: 'AugTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Sep-' + currYear : 'September',
          field: 'september',
          style: 'text-align: right',
          template: 'SepTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Oct-' + currYear : 'October',
          field: 'october',
          style: 'text-align: right',
          template: 'OctTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Nov-' + currYear : 'November',
          field: 'november',
          style: 'text-align: right',
          template: 'NovTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Dec-' + currYear : 'December',
          field: 'december',
          style: 'text-align: right',
          template: 'DecTpl',
          headerStyle: headerStyle,
          width: 120
        },
        {
          headerText: currYear ? 'Total-' + currYear : 'Total',
          field: 'total_curr_year',
          style: 'text-align: right',
          template: 'TotalTpl',
          headerStyle: disabledHeaderStyle,
          width: 120
        },
        {
          headerText: nextYear ? 'Balance-' + nextYear : 'Balance',
          field: 'total_bal_next_year',
          style: 'text-align: right',
          template: 'BalanceTpl',
          headerStyle: disabledHeaderStyle,
          width: 120
        }
      ];
    }

    /**
     * General purpose logging utility.
     * @param {any} arg1
     */
    logging(arg1) {
      console.log('logging==>' + JSON.stringify(arg1));
    }

    calcBudgetTotal(row) {
      if (!row) return '0.000';
      const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const total = months.reduce((sum, m) => sum + (parseFloat(row[m]) || 0), 0);
      return total.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    };
    
  }
  
  return PageModule;
});
