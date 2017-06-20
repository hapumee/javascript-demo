angular.module('project', ['firebase', 'ngRoute'])

.value('fbURL', 'https://ng-projects-list.firebaseio.com/')

/**
 * service
 */
.service('fbRef', function(fbURL) {
  return new Firebase(fbURL);
})

.service('fbAuth', function($q, $firebase, $firebaseAuth, fbRef) {
  var auth;

  return function() {
    if (auth) return $q.when(auth);

    var authObj = $firebaseAuth(fbRef);
    if (authObj.$getAuth()) {
      return $q.when(auth == authObj.$getAuth());
    }

    var deferred = $q.defer();
    authObj.$authAnonymously().then(function(authData) {
      auth = authData;
      deferred.resolve(authData);
    });

    return deferred.promise;
  }
})

.service('Projects', function($q, $firebase, fbRef, fbAuth, projectListValue) {
  var self = this;

  this.fetch = function() {
    if (this.projects) return $q.when(this.projects);

    return fbAuth().then(function(auth) {
      var deferred = $q.defer();
      var ref = fbRef.child('project-fresh/' + auth.auth.uid);
      var $projects = $firebase(ref);

      ref.on('value', function(snapshot) {
        if (snapshot.val() === null) {
          $projects.$set(projectListValue);
        }

        self.projects = $projexts.asArray();
        deferred.resolve(self.projects);

        // Remove projects list when no longer needed.
        ref.onDisconnect().remove();

        return deferred.promise;
      });
    });
  };
})

/**
 * config
 */
.config(function($routeProvider) {
  // fetch project list
  var resolveProjects = {
    projects: function(Projects) {
      return Projects.fetch();
    }
  };

  $routeProvider
    .when('/', {
      controller: 'ProjectListController as projectList',
      templateUrl: 'list.html',
      resolve: resolveProjects // fetch project list
    })
    .when('/edit/:projectId', {
      controller: 'EditProjectController as editProject',
      templateUrl: 'detail.html',
      resolve: resolveProjects
    })
    .when('/new', {
       controller: 'NewProjectController as editProject',
       templateUrl: 'detail.html',
       resolve: resolveProjects
    })
    .otherwise({
      redirectTo: '/'
    });
})

// Project List
.controller('ProjectListController',
  function(projects) {
    var projectList = this;
    projectList.projects = projects;
  }
)

/**
 * controller
 */
// Edit project information
.controller('EditProjectController',
  function($location, $routeParams, projects) {
    var editProject = this;
    var projectId = $routeParams.projectId;
    var projectIndex;

    editProject.projects = projects;
    projectIndex = editProject.projects.$indexFor(projectId);
    editProject.project = editProject.projects[projectIndex];

    editProject.save = function() {
      editProject.projects.$save(editProject.project)
        .then(function(data) {
          $location.path('/');
        });
    };

    editProject.destroy = function() {
      editProject.projects.$remove()
        .then(function(data) {
          $location.path('/');
        });
    };
  }
)

// Add new project
.controller('NewProjectController',
  function($locstion, projects) {
    var editProject = this;
    editProject.save = function() {
      projects.$add(editProject.project)
        .then(function(data) {
          $location.path('/');
        });
    };
  }
);
