(function() {
  'use strict';
  angular.module('accordion-steps', [])

  .service('accordionService', function($timeout, $q, $rootScope) {
    var collapsibleItems = [];
    var currentAccordion = collapsibleItems[0] || null;
    var currentAccordionSlider = this;
    /**
     * initialize accordion service
     */
    this.init = function() {
      collapsibleItems.length = 0;
      currentAccordion = collapsibleItems[0] || null;
    };
    /**
     * get all accordions
     * @return {Array} returns array of objects
     */
    this.getAll = function() {
      return collapsibleItems;
    };
    this.setCurrentAccordion = function(val) {
      currentAccordion = val;
      $rootScope.$broadcast('accordionService:change', val);
    };
    this.setAccordion = function(val) {
      val.index = collapsibleItems.length;
      collapsibleItems.push(val);
    };
    this.nextAccordion = function(nextNum) {
      currentAccordion = currentAccordion || collapsibleItems[0];
      var deferred = $q.defer();
      var len = collapsibleItems.length;
      var i = currentAccordion.index;
      var nextval = nextNum > 0 && nextNum || i + 1;
      if (nextval < len) {
        this.oneAtATime(collapsibleItems[nextval]);
        deferred.resolve(nextval);
      } else {
        collapsibleItems[i].isOpenned = false;
        collapsibleItems[i].icon = collapsibleItems[i].closeIcon;
        deferred.resolve(-1);
      }
      return deferred.promise;
    };
    this.openAll = function() {
      currentAccordion = null;
      angular.forEach(collapsibleItems, function(collapsibleItem) {
        collapsibleItem.isOpenned = true;
        collapsibleItem.icon = collapsibleItem.openIcon;
      });
    };
    this.oneAtATime = function(newItem) {
      angular.forEach(collapsibleItems, function(collapsibleItem) {
        collapsibleItem.isOpenned = false;
        collapsibleItem.icon = collapsibleItem.closeIcon;
      });
      newItem.isOpenned = true;
      newItem.icon = newItem.openIcon;
      currentAccordionSlider.setCurrentAccordion(newItem);
    };
    this.getAccordion = function() {
      return currentAccordion;
    };
  })

  .controller('accordionController', ['$scope', '$timeout',
    'accordionService',
    function($scope, $timeout, accordionService) {
      accordionService.init();
      this.openCollapsibleItem = function(collapsibleItemToOpen) {
        if ($scope.oneAtATime) {
          accordionService.oneAtATime(collapsibleItemToOpen);
        }
      };
      this.addCollapsibleItem = function(collapsibleItem) {
        accordionService.setAccordion(collapsibleItem);
        if ($scope.closeIconClass !== undefined || $scope.openIconClass !==
          undefined) {
          collapsibleItem.iconsType = 'class';
          collapsibleItem.closeIcon = $scope.closeIconClass;
          collapsibleItem.openIcon = $scope.openIconClass;
        }
        collapsibleItem.iconIsOnLeft = $scope.iconPosition === 'left';
      };
    }
  ])

  .directive('accordion', function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        oneAtATime: '@',
        closeIconClass: '@',
        openIconClass: '@',
        iconPosition: '@'
      },
      controller: 'accordionController',
      template: '<div class="accordion" ng-transclude></div>'
    };
  })

  .directive('accordionItem', function($timeout) {
    return {
      require: '^accordion',
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        itemTitle: '@',
        itemDisabled: '=',
        open: '=',
        accordionId: '@',
        formName: '@'
      },
      link: function(scope, element, attrs, accordionController) {

        scope.isOpenned = scope.open;
        accordionController.addCollapsibleItem(scope);
        if (scope.isOpenned) {
          scope.icon = scope.openIcon;
        } else {
          scope.icon = scope.closeIcon;
        }
        scope.$watch(
          function() {
            return element[0].offsetHeight;
          },
          function(newValue) {
            scope.height=element[0].offsetHeight-30 +'px';
          });
        scope.toggleCollapsibleItem = function() {
          $timeout(function(){
            scope.height=element[0].offsetHeight-30 +'px';
          })
          if (scope.itemDisabled) {
            return;
          }
          if (scope.isOpenned === false) {
            accordionController.openCollapsibleItem(this);
            scope.icon = scope.openIcon;
          } else {
            scope.isOpenned = false;
            scope.icon = scope.closeIcon;
          }
        };
      },
      template: '<div class="clearfix">'+
                  '<div class="left-progress-bar">'+
                    '<div class="node bg-blue"><span class="status">{{$id}}</span></div>'+
                    '<div class="divider" ng-style="{height:height}"></div>'+
                  '</div>'+
                  '<div class="accordion-section" ng-class="{open: isOpenned}">'+
                    '<div class="accordion-header">'+
                      '<div class="accordion-section-title" ng-class="{disabled: itemDisabled}" ng-click="toggleCollapsibleItem()">{{itemTitle}}<i class="{{icon}} icon" ng-class="{iconleft: iconIsOnLeft}"></i></div>'+
                    '</div>'+
                    '<div class="accordion-section-content">'+
                      '<div class="content" ng-transclude></div>'+
                    '</div>'+
                  '</div>'+
                '</div>'
    };
  });
})();
