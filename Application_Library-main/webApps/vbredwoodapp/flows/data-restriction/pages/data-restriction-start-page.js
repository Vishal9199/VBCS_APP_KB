define(['ojs/ojpagingdataproviderview', 'ojs/ojarraydataprovider'],
function(PagingDataProviderView, ArrayDataProvider) {
  'use strict';
  var PageModule = function PageModule() {};
  // Paging Data Function
  PageModule.prototype.pagingdata = function(array) {
    var data = new PagingDataProviderView(new ArrayDataProvider(
      array, {
        idAttribute: 'restriction_id'
      }));
    return data;
  };
  return PageModule;
});