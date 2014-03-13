'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('app', ['ngResource'])
	.config(function($routeProvider, $locationProvider, $httpProvider) {
		
    //================================================
	//
	// define a function to check the user logged in or not
    // Check if the user is connected
	//
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user){
        // Authenticated
        if (user !== '0')
          $timeout(deferred.resolve, 0);

        // Not Authenticated
        else {
          $rootScope.message = 'You need to log in.';
          $timeout(function(){deferred.reject();}, 0);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    //
    // Add an interceptor to every AJAX calls.
    // Because we need to detect when an AJAX call returns a 401 status.
    //
    //================================================
    $httpProvider.responseInterceptors.push(function($q, $location) {
      return function(promise) {
        return promise.then(
          // Success: just return the response
          function(response){
            return response;
          }, 
          // Error: check the error status to get only the 401
          function(response) {
            if (response.status === 401)
              $location.url('/login');
            return $q.reject(response);
          }
        );
      }
    });
    //================================================

    //================================================
    //
    // Define all the routes
    // For /admin, used promise/$q/resolve to resolve the promise
    //
    //================================================
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html'
      })
      .when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    //================================================

  }) // end of config()
  .run(function($rootScope, $http){
    $rootScope.message = '';

    // Logout function is available in any pages
    $rootScope.logout = function(){
      $rootScope.message = 'Logged out.';
      $http.post('/logout');
    };
  });


/**********************************************************************
 * 
 * Login controller
 * 
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
  // This object will be filled by the form
  $scope.user = {};

  // 
  // Register the login() function
  // The use.username and user.password defined using ng-model in login.html
  //
  $scope.login = function(){
    $http.post('/login', {
      username: $scope.user.username,
      password: $scope.user.password,
    })
    .success(function(user){
      //
      // No error: authentication OK
      // Rout to /admin
      // Update rootScope.message for main.html
      //
      $rootScope.message = 'Authentication successful!';
      $location.url('/admin');
    })
    .error(function(){
      //
      // Error: authentication failed
      // Rout to /login
      // Update rootScope.message for main.html
      //
      $rootScope.message = 'Authentication failed.';
      $location.url('/login');
    });
  };
});



/**********************************************************************
 * 
 * Admin controller
 * 
 **********************************************************************/
app.controller('AdminCtrl', function($scope, $http) {
  // List of users got from the server
  $scope.users = [];

  // 
  // Get web contents by call a web service call
  // Fill the array to display it in the page using ng-repeat in admin.html
  // 
  $http.get('/users').success(function(users){
    for (var i in users){
    	$scope.users.push(users[i]);
    }      
  });
});
