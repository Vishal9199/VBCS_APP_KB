/* Copyright (c) 2025, Oracle and/or its affiliates */

define([
  'oj-sp/spectra-shell/config/config',
  'resources/js/crypto'
], function (config, CryptoJS) {
  'use strict';

  class AppModule {

    getSysdate() {
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0');
      let yyyy = today.getFullYear();
      today = yyyy + '-' + mm + '-' + dd;
      return today;
    }
    todayDate() {
      const now = new Date();
      const isoDate = now.toISOString();
      const dateOnly = isoDate.split('T')[0];
      return isoDate;
    }
    removeTimeZone(inputDate) {
      const dateWithoutTimeZone = inputDate.replace("T00:00:00Z", "");
      return dateWithoutTimeZone;
    }

    // ✅ New function: strips timestamp and returns only YYYY-MM-DD
    removeTimeStamp(inputDate) {
      if (!inputDate) return null;

      const date = new Date(inputDate);

      if (isNaN(date.getTime())) {
        console.warn("Invalid date passed to removeTimeStamp:", inputDate);
        return inputDate; // fallback: return original
      }

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd}`;
    }

    encryptJs(key, payload) {
      const parsedKey = CryptoJS.enc.Utf8.parse(key);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), parsedKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv
      });
      const ivAndEncrypted = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
      return ivAndEncrypted;
    }

    clearSmartSearchChips() {
      // Query all the close anchors for the chips
      const chips = document.querySelectorAll('.oj-sp-filter-chip-close-anchor-invisible');

      chips.forEach((chip, index) => {
        setTimeout(() => {
          try {
            chip.click();
          } catch (e) {
            console.warn("Failed to remove chip:", e);
          }
        }, index * 100); // stagger clicks to avoid race conditions
      });
    }

    updateSmartSearchPlaceHolder() {
      const inputEl = document.querySelector(
        ".oj-sp-smart-search-bar-input-text-container input"
      );

      if (inputEl) {
        inputEl.setAttribute("placeholder", "Search");
      }
    }

    reorderListItems(order) {
      const ul = document.getElementById("smart_searchbar-suggestions-bar");
      if (!ul || !order) return;

      const items = Array.from(ul.querySelectorAll("li"));

      items.sort((a, b) => {
        const aKey = a.getAttribute("data-key");
        const bKey = b.getAttribute("data-key");
        const aIndex = order.indexOf(aKey);
        const bIndex = order.indexOf(bKey);
        return aIndex - bIndex;
      });

      items.forEach(item => ul.removeChild(item));
      items.forEach(item => ul.appendChild(item));
      items.forEach((item, idx) => item.setAttribute("aria-rowindex", idx + 1));
    }

    clearAllFilterChips() {
      const chips = document.querySelectorAll('.oj-sp-filter-chip-close-anchor-invisible');

      chips.forEach((chip, index) => {
        setTimeout(() => {
          chip.click();
        }, index * 100); // delay clicks to avoid DOM issues
      });
    };

    normalizeDate(dateValue) {
      if (!dateValue) {
        return ""; // handles null or empty
      }

      // If it contains 'T' (timestamp format), split and take only the date
      if (typeof dateValue === "string" && dateValue.includes("T")) {
        return dateValue.split("T")[0];
      }

      // Otherwise, return as-is (already a date like "4712-12-31")
      return dateValue;
    }
    formatDateForDB(dateValue) {
      if (!dateValue) return "";

      const date = new Date(dateValue);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }


  }

  return AppModule;
});
