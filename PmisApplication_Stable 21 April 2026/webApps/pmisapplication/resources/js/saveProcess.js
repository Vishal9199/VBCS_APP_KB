define([], () => {
  'use strict';

  class SaveProcess {
    
    // ============================================
    // GLOBAL DEBUG FLAG - Set to false for production
    // ============================================
    constructor() {
      this.DEBUG_MODE = true; // Set to false to disable all console logs
    }
    // END: constructor

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
    // END: log

    // ============================================
    // METHOD 1 - onPageNaviFun
    // ============================================
    onPageNaviFun(naviValue) {
      let navi = null;
      if (naviValue === "CREATE") {
        navi = "POST";
      } else {
        navi = "PUT";
      }
      this.log("navi==>", navi);
      return navi;
    }
    // END: onPageNaviFun

    // ============================================
    // METHOD 2 - getPrimaryKey
    // ============================================
    getPrimaryKey(naviValue, keyValue) {
      let keyValueResult = null;
      this.log("naviValue Key===>", naviValue);
      this.log("Key===>", keyValue);
      
      if (naviValue === "CREATE") {
        keyValueResult = "0";
        this.log("ADD==>", keyValueResult);
      } else {
        keyValueResult = keyValue;
        this.log("ELS==>", keyValueResult);
      }
      return keyValueResult;
    }
    // END: getPrimaryKey
    
    // ============================================
    // METHOD 3 - getToolBar
    // ============================================
    getToolBar(taskId, statusCode, appr_level) {
      let flag = "FINAL";
      // let level = appr_level;
      
      this.log("flag->task==>", taskId);
      this.log("flag->status==>", statusCode);
      this.log("level->level==>", appr_level);
      
      if (taskId !== undefined && taskId !== null) {
        // Task ID has value
        if(appr_level === 4 || appr_level === '4')
        {
          flag = "toolFourthLevel";
          this.log("Task ID exists: 4th Level");
        }
        else if (statusCode === "PEN") {
          flag = "PENDING";
          this.log("Task ID exists: PENDING");
        }
        else if(statusCode === "RPA")
        {
          flag = "RPA";
          this.log("Task ID exists: RPA");
        }
        // else if(appr_level === 4 || appr_level === '4')
        // {
        //   flag = "toolFourthLevel";
        //   this.log("Task ID exists: 4th Level");
        // }
        else {
          flag = "FINAL";
          this.log("Task ID exists: FINAL");
        }
      } else {
        // Task ID is null/undefined (no value)
        this.log("No Task ID");
        if (statusCode === "DRA" || statusCode === "RIM" || statusCode === "RIA" || statusCode === "WR") {
          flag = "DRAFT";
          this.log("No Task ID: DRAFT");
        }
        // else if(statusCode === "RPA") {
        //   flag = "RPA";
        //   this.log("No Task ID: RPA");
        // }
        else if (statusCode === "PEN") {
          flag = "WITHDRAW";
          this.log("No Task ID: PENDING > PENDING");
        }else if (statusCode === "ERR" ) {
          flag = "ERROR";
          this.log("No Task ID: ERROR");
        } else {
          flag = "FINAL";
          this.log("No Task ID: FINAL");
        }
      }
      
      this.log("flag->final==>", flag);
      return flag;
    }
    // END: getToolBar

  }
  
  return SaveProcess;
});