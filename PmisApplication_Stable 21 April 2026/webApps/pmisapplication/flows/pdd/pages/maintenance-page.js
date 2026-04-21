define([], () => {
  'use strict';

  class PageModule {

    clearAllFilterChips() {
      const chips = document.querySelectorAll('.oj-sp-filter-chip-close-anchor-invisible');

      chips.forEach((chip, index) => {
        setTimeout(() => {
          chip.click();
        }, index * 100); // delay clicks to avoid DOM issues
      });
    };
  }

  return PageModule;
});
