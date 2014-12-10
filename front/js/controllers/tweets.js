angular.module('patremonium')
.controller('tweetsController', function ($scope, data) {
  $scope.tweets = data.tweets;
});
