// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var App=angular.module('starter', ['starter.controllers','ui.router','ngMaterial','ngMessages']).config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('home', {
      url: '/home',
      templateUrl: 'templates/home.html'
  }).state('createprofile', {
      url: '/createprofile',
      templateUrl: 'templates/CreateProfile.html',
      controller:'createprofile'
  }).state('profile', {
      url: '/profile',
      templateUrl: 'templates/Profile.html',
      controller:'profile'
  }).state('issue', {
      url: '/issue',
      templateUrl: 'templates/issue.html',
      controller:'issue'
      
  }).state('receipt', {
      url: '/receipt',
      templateUrl: 'templates/Receipt.html',
      controller:'receipt'
      
  });;


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('profile');

});

App.factory('PostService', function($http){
    return {
        async: function(postUrl,postData) {
            return $http({
                method: 'POST',
                url: postUrl,
                data: postData

            });
        }
    };
});

App.factory('GetService', function($http){
    return {
        async: function(getUrl) {
            return $http({
                method: 'GET',
                url: getUrl

            });
        }
    };
});

App.factory('DataPasser',function(){
    var dataPasser ={};
    dataPasser.setData=function(data){
        this.data = data;
    }
    dataPasser.getData=function(){
        return this.data;
    }

    return dataPasser;
});

