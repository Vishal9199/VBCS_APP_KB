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

  class NavigationListSelectionChangeChain extends ActionChain {

    async run(context, { selectionEvent }) {
      const { $variables, $application } = context;

      try {
        const selectedItemId = selectionEvent;

        if (!selectedItemId) {
          return;
        }

        console.log("==> Selected Item:", selectedItemId);

        // Update selection
        $variables.MenuSelection = selectedItemId;

        // Close drawer
        $variables.drawerOpen = false;

        // Direct navigation mapping
        let navigationPath = '';

        switch (selectedItemId) {
          case 'pddgeneral': {
            navigationPath = 'pdd/general';

            const toPdd3 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'general',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });

            // const toPddGeneral = await Actions.navigateToFlow(context, {
            //   flow: 'pdd', page: 'general', params: { pNavCode: 'EDIT', pNavId: '123' },
            // });
            break;
          }
          case 'pddattribute':
            navigationPath = 'pdd/attribute-page';
            const toPdd = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'attribute',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;

          case 'pddcontract-contract':
            navigationPath = 'pdd/contract-page';

            const toPdd2 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'contract',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddcontract-contact':
            navigationPath = 'pdd/contact-page';

            const toPdd4 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'contact',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;

          case 'pddschedule':
            navigationPath = 'pdd/schedule';
            const toPddSchedule = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'schedule',
              params: {
                pNavCode: 'EDIT',
                pNavId: '123',
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;

          case 'pddstatusupdate':
            navigationPath = 'pdd/progress-page';

            const toPdd5 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'statusupdate',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddstatusupdate-progress':
            navigationPath = 'pdd/progress-page';
          
            const toPdd6 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'statusprogress',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddstatusupdate-hse':
            navigationPath = 'pdd/hse-page';

            const toPdd9 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'statushse',
              params: {
                pTenderId: $application.variables.pTenderId,
                periodName: $application.variables.pPeriod,
              },
            });
            break;
          case 'pddstatusupdate-quality':
            navigationPath = 'pdd/quality-control-page';

            const toPdd7 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'qualitycontrol',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddpayment':
            navigationPath = 'pdd/payment-certification-page';

            const toPdd14 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'paymentcertification',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddbudget':
            navigationPath = 'pdd/budget-control-page';

            const toPdd11 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'budgetcontrolsearch',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddstakeholder':
            navigationPath = 'pdd/stakeholder-analysis-page';

            const toPdd8 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'stakeholder',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddchangeorder':
            navigationPath = 'pdd/change-order-page';

            const toPdd10 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'changeorder',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddchangevariation':
            navigationPath = 'pdd/change-variation-register-page';

            const toPdd15 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'changecontrol',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddriskmanage':
            navigationPath = 'pdd/risk-management-page';

            const toPdd12 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'riskmanage',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddissueregister':
            navigationPath = 'pdd/issue-register-page';

            const toPdd13 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'issueregister',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddlesson':
            navigationPath = 'pdd/lesson-learned-page';

            const toPdd17 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'lessonlearned',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddweekly':
            navigationPath = 'pdd/weekly-highlights-page';

            const toPdd18 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'weeklyhighlights',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddincountryvalue':
            navigationPath = 'pdd/incountryvalue-page';
          
            const toPdd19 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'incountryvalue',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddprojectlist':
            navigationPath = 'pdd/projectlist-page';

            const toPdd20 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'projectlist',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pdddocuments':
            navigationPath = 'pdd/project-documents-page';
          
            const toPdd16 = await Actions.navigateToFlow(context, {
              flow: 'pdd',
              page: 'projectdocuments',
              params: {
                pTenderId: $application.variables.pTenderId,
              },
            });
            break;
          case 'pddqliksense':
            navigationPath = 'pdd/qliksense-dashboard-page';
            break;
          default:
            console.warn('==> Unknown menu item:', selectedItemId);
            return;
        }

        console.log("==> Navigating to:", navigationPath);

        // Navigate using the path
        // await Actions.navigateToApplication(context, {
        //   path: navigationPath
        // });

        console.log("==> Navigation successful");

      } catch (error) {
        console.error("==> Navigation Error:", error);
      }
    }
  }

  return NavigationListSelectionChangeChain;
});