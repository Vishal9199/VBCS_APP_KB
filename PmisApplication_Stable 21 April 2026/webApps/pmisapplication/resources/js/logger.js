define([], function () {
  'use strict';

  const styles = {
    info: "color:#2e7d32; font-weight:bold;",
    warn: "color:#ed6c02; font-weight:bold;",
    error: "color:#d32f2f; font-weight:bold;",
    debug: "color:#0288d1; font-weight:bold;",
    group: "color:#6a1b9a; font-weight:bold;"
  };

  function log(type, msg, data) {
    if (data !== undefined) {
      console.log(`%c[${type.toUpperCase()}] ${msg}`, styles[type], data);
    } else {
      console.log(`%c[${type.toUpperCase()}] ${msg}`, styles[type]);
    }
  }

  return {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
    debug: (msg, data) => log('debug', msg, data),

    groupStart: (title) => {
      console.group(`%c${title}`, styles.group);
    },
    groupEnd: () => {
      console.groupEnd();
    }
  };
});