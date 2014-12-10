// Include app dependency on ngMaterial	
var patremonium = angular.module( 'patremonium', [ 'ngMaterial', 'ngRoute' ] );

patremonium.factory('authInterceptor', function ($rootScope, $q, $window, $location) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      if ($window.localStorage.getItem('user')) {
        var user = $window.localStorage.getItem('user');
        $rootScope.user = JSON.parse(user);
      } else {
        $location.path('/login');
      }
      return config;
    },
    responseError: function (response) {
      if (response.status === 401) {
        $location.path('/login');
      }
      return response || $q.when(response);
    }
  };
});
patremonium.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
patremonium.controller("MainController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window) {
  	$rootScope.LoggedOut = true;	
  	// This flag we use to show or hide the button in our HTML.  	
    $rootScope.signedIn = false; 
    // Here we do the authentication processing and error handling.
    // Note that authResult is a JSON object.   
}]);
patremonium.controller("LoginController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
	$scope.processAuth = function(authResult) {
    // Do a check if authentication has been successful.       
    $scope.authResult = authResult; 
    if(authResult['access_token']) {             
      // Successful sign in.
      $scope.signedIn = true;
      $http.post('/authenticate', {
        authResult: authResult['code']
 	    }).success(function(data, status, headers, config){
 	      $rootScope.signedIn = false;  
 	      $rootScope.LoggedOut = false;      		     
 	      $rootScope.user = data.response.google;
 	      $rootScope.token = data.token;      		      
        $window.sessionStorage.token = data.token;
        $window.sessionStorage.userRole = data.response.userRole;
        $window.localStorage.setItem('user', JSON.stringify(data.response.google));      		      
      });
    } else if(authResult['error']) {
      // Error while signing in.
      $scope.signedIn = false;   
      // Report error. 
    }        
  };
	$scope.signInCallback = function(authResult) {        
    $scope.processAuth(authResult);        
  };
	$scope.renderSignInButton = function() {		
        gapi.signin.render('signInButton',
            {
                'callback': $scope.signInCallback, // Function handling the callback.
                'clientid': '273207854014-32vo8nirrr75jti027sub8d92secgccc.apps.googleusercontent.com', // CLIENT_ID from developer console which has been explained earlier.
                'requestvisibleactions': 'http://schemas.google.com/AddActivity', // Visible actions, scope and cookie policy wont be described now,                                                                                  // as their explanation is available in Google+ API Documentation.
                'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                'cookiepolicy': 'single_host_origin',
                'redirecturi': "postmessage",
                'accesstype': 'offline'
            }
        );
    };	
    // Start function in this example only renders the sign in button.
    $scope.start = function() {
        $scope.renderSignInButton();
    }; 
    // Call start function on load.
    $scope.start();		
}]);
patremonium.controller("ListController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
  $http({url: '/api/users/'+$rootScope.user.id, method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.signedIn = false;  
    $rootScope.LoggedOut = false;              
    $rootScope.user = data.user.google;
  });
}]);
patremonium.controller("UserController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
  $http({url: '/api/users/'+$rootScope.user.id, method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.signedIn = false;  
    $rootScope.LoggedOut = true;              
    $rootScope.user = data.user.google;    
  });
  $scope.userRole = $window.sessionStorage.userRole;
}]);
patremonium.controller("AdminController", ['$scope', '$rootScope', '$http', '$window', '$mdToast', function($scope, $rootScope, $http, $window, $mdToast){
  $http({url: '/api/users/', method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.signedIn = false;  
    $rootScope.LoggedOut = true;              
    $scope.users = data;    
  });  
  $scope.showToast = function(e, detail) {
    $mdToast.show($mdToast.simple().content('Hello!'));
  };
  $scope.userRole = $window.sessionStorage.userRole;
}]);
patremonium.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'html/list.html', controller: patremonium.ListController})
		.when('/user/:id', {templateUrl: 'html/user/profile.html', controller: patremonium.UserController})
		.when('/admin/users/', {templateUrl: 'html/admin/users.html', controller: patremonium.AdminController})
		.when('/login', {templateUrl: 'html/login.html', controller: patremonium.LoginController})
		.otherwise({redirectTo: '/'});
}]);

document.addEventListener('polymer-ready', function() {
  var navicon = document.getElementById('dossierSidebar');
  var drawerPanel = document.getElementById('panel');
  navicon.addEventListener('click', function() {
    drawerPanel.togglePanel();
  });
  var naviconAccount = document.getElementById('infoSidebar');
  var drawerPanelAccount = document.getElementById('mainPanel');
  naviconAccount.addEventListener('click', function() {
    drawerPanelAccount.togglePanel();
  });
});