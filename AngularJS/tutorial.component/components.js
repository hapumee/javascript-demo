angular.module('components', [])

.directive('tabs', function() {
  var options = {
    restrict: 'E', // 'E' means only matches element name
    transclude: true, // makes the contents of a directive have access to the scope outside of the directive rather than inside
    scope: {}, // scope
    template:
      '<div class"tabbable">'+
        '<ul class="nav nav-tabs">'+
          '<li ng-repeat="pane in panes" ng-class="{active: pane.selected}">'+
            '<a href="" ng-click="select(pane)">{{pane.title}}</a>'+
          '</li>'+
        '</ul>'+
        '<div class="tab-content" ng-transclude></div>'+
      '</div>',
    controller: function($scope, $element) { // Controller
      var panes = $scope.panes = [];

      $scope.select = function(pane) {
        angular.forEach(panes, function(pane) {
          pane.selected = false; // initiate all selected attributes
        });

        pane.selected = true; // set selected element (<li>)
      };

      // register itself with <tabs> container
      this.addPane = function(pane) {
        if (panes.length == 0) $scope.select(pane);
        panes.push(pane);
      };
    },
    replace: true // original <tabs> should be replaced with [template] rathen than appending it
  };

  return options;
})

.directive('pane', function() {
  var options = {
    require: '^tabs',
    // require : the <pane> component must be inside <tabs> component.
    // the <pane> component access to the <tabs> controller method.
    restrict: 'E',
    transclude: true,
    scope: {title: '@'},
    link: function(scope, element, attrs, tabsController) {
        // tabsController : we've specified we "require" the <tabs> as a container,
        // we get passed its controller instance.
        tabsController.addPane(scope);
    },
    // link function : update the displayed time once a second, or whenever a user changes the time formatting string that our directive binds to.
    template:
      '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>'+
      '</div>',
    replace: true
  };

  return options;
})
;
