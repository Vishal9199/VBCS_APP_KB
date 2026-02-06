define([], () => {
  'use strict';

  class ApprovalProcess {

    // ============================================
    // STATIC CONSTANTS - Approval Process Types
    // ============================================
    // static MISC_TRANSACTION_APPROVAL_PROCESS = "MISC_TRANSACTION";
    // static PR_APPROVAL_PROCESS = "PR_APPROVAL";
    // static ITEM_APPROVAL_PROCESS = "ITEM_APPROVAL";

    // exampleMiscTransactionProd() {
    //   // Get PROD configuration
    //   const config = ApprovalProcess.getConfig("prod");
    //   // Access MISC_TRANSACTION values
    //   const miscConfig = config.MISC_TRANSACTION;
    //   console.log("Application Name:", miscConfig.applicationName); // "ExcelUploadProd"
    //   console.log("Application Version:", miscConfig.applicationVersion); // "1.0"
    //   console.log("Process Name:", miscConfig.processName); // "ProcessProd"
    //   return miscConfig;
    // }



    // ============================================
    // ENVIRONMENT CONFIGURATION METHOD
    // ============================================
    getConfig(appType) {
      const configs = {
        uat: {
          SERVICE_SPECIFICATION: {
            callSubmitPackage: "NO",
            applicationName: "ServiceSpecification",
            applicationVersion: "1.1",
            processName: "ServiceSpecificationProcess",
            // url: "https://oic-vbcs-owwscoicuat-vb-frg175ushz37.builder.eu-frankfurt-1.ocp.oraclecloud.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/"
            url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/",
            log_url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/TransactionLog/live/webApps/vbredwoodapp/"
          }
        },
        prod: {
          SERVICE_SPECIFICATION: {
            callSubmitPackage: "NO",
            applicationName: "ServiceSpecification",
            applicationVersion: "1.1",
            processName: "ServiceSpecificationProcess",
            // url: "https://oic-vbcs-owwscoicuat-vb-frg175ushz37.builder.eu-frankfurt-1.ocp.oraclecloud.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/"
            url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/",
            log_url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/TransactionLog/live/webApps/vbredwoodapp/"
          }
        },
        live: {
          SERVICE_SPECIFICATION: {
            callSubmitPackage: "NO",
            applicationName: "ServiceSpecification",
            applicationVersion: "1.1",
            processName: "ServiceSpecificationProcess",
            // url: "https://oic-vbcs-owwscoicuat-vb-frg175ushz37.builder.eu-frankfurt-1.ocp.oraclecloud.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/"
            url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/",
            log_url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/TransactionLog/live/webApps/vbredwoodapp/"
          }
        },
        dev: {
          SERVICE_SPECIFICATION: {
            callSubmitPackage: "NO",
            applicationName: "ServiceSpecification",
            applicationVersion: "1.1",
            processName: "ServiceSpecificationProcess",
            // url: "https://oic-vbcs-owwscoicuat-vb-frg175ushz37.builder.eu-frankfurt-1.ocp.oraclecloud.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/"
            url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/ApprovalHistory/live/webApps/vbredwoodapp/",
            log_url: "https://oic-vbcs-oci-vufoic1-vb-axe4mqwwmret.builder.me-dcc-muscat-1.ocp.oraclecloud9.com/ic/builder/rt/TransactionLog/live/webApps/vbredwoodapp/"
          }
        }
      };

      const envType = appType.toLowerCase();
      if (configs[envType]) {
        return configs[envType];
      } else {
        console.warn(`Invalid environment type: ${appType}. Defaulting to DEV configuration.`);
        return configs.dev;
      }
    }

    // ============================================
    // GLOBAL DEBUG FLAG - Set to false for production
    // ============================================
    constructor() {
      this.DEBUG_MODE = true; // Set to false to disable all console logs
    }

    // ============================================
    // CENTRALIZED LOGGING METHOD
    // ============================================
    log(message, data = null) {
      if (this.DEBUG_MODE) {
        if (data !== null) {
          console.log(message, data);
        } else {
          console.log(message);
        }
      }
    }

    // ============================================
    // MAIN METHOD - getToolBar
    // ============================================
    getToolBar(taskId, statusCode) {
      let flag = "FINAL";
      this.log("flag->task==>", taskId);
      this.log("flag->status==>", statusCode);

      if (taskId !== undefined && taskId !== null) {
        // Task ID has value
        if (statusCode === "PEN") {
          flag = "PENDING";
          this.log("Task ID exists: PENDING");
        } else {
          flag = "FINAL";
          this.log("Task ID exists: FINAL");
        }
      } else {
        // Task ID is null/undefined (no value)
        this.log("No Task ID");
        if (statusCode === "DRA" || statusCode === "RIM" || statusCode === "RIA" || statusCode === "WRW") {
          flag = "DRAFT";
          this.log("No Task ID: DRAFT");
        } else if (statusCode === "PEN") {
          flag = "WITHDRAW";
          this.log("No Task ID: WITHDRAW");
        } else {
          flag = "FINAL";
          this.log("No Task ID: FINAL");
        }
      }

      this.log("flag->final==>", flag);
      return flag;
    }
    // ============================================

  }

  return ApprovalProcess;
});