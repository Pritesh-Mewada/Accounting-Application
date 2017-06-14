var control = angular.module('starter.controllers', []);

control.controller('createprofile',function ($scope,PostService,$state) {
    $scope.user={
        name:'',
        email:'',
        telephone:'',
        address:''
    }
    $scope.submit = function () {
        alert("demo");
        PostService.async("/create",$scope.user).then(function (response){
            console.log(response)
            if(response.data=="Success"){
                $state.go("profile")
            }
        },function (error) {
            console.log(error)
        });
    }


})

control.controller('profile',function ($scope,GetService,$state,$mdDialog,$mdMenu,DataPasser){
    GetService.async('/profiles').then(function (response) {
        
        $scope.profiles = response.data;
    },function (error) {
        console.log(error);
    })
    $scope.GoToCreate = function () {
        $state.go("createprofile")
    }

    var originatorEv;

    $scope.openMenu  = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
      
    };

    this.notificationsEnabled = true;
    this.toggleNotifications = function() {
      this.notificationsEnabled = !this.notificationsEnabled;
    };

    this.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
      );

      originatorEv = null;
    };

    $scope.goToIssue = function(profile){
      
      DataPasser.setData(profile);
      $state.go("issue");
    }
    $scope.goToWastage =function(profile){
      DataPasser.setData(profile);
      $state.go("receipt");
    }
});

control.controller('issue',function($scope,$mdDialog,DataPasser,PostService,GetService,$rootScope){
    $scope.mainData=[];
    $scope.profiles=[];
    $scope.data={};
    console.log("i am called");
    $scope.customFullscreen = false;
    $scope.name = DataPasser.getData().name;
    var calcFineWeight = function(){
      $scope.fineWeight ="";
      var temp=0; 
      for(var i=0;i<$scope.profiles.length;i++){
          temp = temp + $scope.profiles[i].fineweight;
        }
      $scope.fineWeight = temp;
      
    }
    GetService.async("/getProfileDataIssue/"+$scope.name).then(function(response){
      
      $scope.profiles=response.data;
      $scope.mainData=response.data;
      
      calcFineWeight();
    },function(error){
      console.log(error);
    })
    $scope.showAdvanced = function(ev) {
        $mdDialog.show({
          controller: 'modalcontrol',
          templateUrl: 'js/issue-dialogue.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
    }
    
    $scope.getDate =function(date){
      var newDate = new Date(date.substring(0,10));
      return newDate.getDate() +"/" + (newDate.getMonth()+1) +"/" + newDate.getFullYear().toString().substring(2,4);
    }

    var getNewObject =function(model){
      var profile = {
         date:model.date,
          grossweight:model.grossweight,
          fine:model.fine,
          comment:model.comment,
          fineweight:model.fineweight
        };
        return profile;  
      }
     
     $rootScope.$on("dataInserted", function(data){
        $scope.profiles.push(getNewObject(DataPasser.getData()));
        $scope.fineWeight = $scope.fineWeight + DataPasser.getData().fineweight;
      });

     var getStandard = function(newDate){
        return newDate.getFullYear().toString()+"-"+(newDate.getMonth()) +"-" + newDate.getDate();
      }
     
     $scope.sortDate = function(){
        if($scope.data.to == null || $scope.data.from ==null ){
          return;
        }
        var formDate = new Date($scope.data.from.toString());
        formDate.setHours(5);
        formDate.setMinutes(30);
        var toDate = new Date($scope.data.to.toString());
        var dataSet = $scope.mainData;
        toDate.setHours(5);
        toDate.setMinutes(30);
        $scope.profiles=[];
        for(var i =0;i<dataSet.length ;i++){
          var compare = new Date(dataSet[i].date.substring(0,10));
          
          if(compare >=formDate &&  compare<=toDate){
            $scope.profiles.push(dataSet[i]);
          }
        }
        calcFineWeight();

      }
})
control.controller('modalcontrol' ,function($scope,$mdDialog,PostService,DataPasser,$rootScope){
  $scope.profile = {
    grossweight:'',
    fine:'',
    comment:'',
    date:''
  };
  $scope.profile.name = DataPasser.getData().name;
  $scope.hello = function(){
      for(var a in $scope.profile){
        console.log(a);
        if($scope.profile[a] == '' && a !='comment'){
          alert("Please fill " + a);
          return;  
        }
      }
      if($scope.profile.fine >100){
        alert("Fine is in Percentage");
        return;
      }


      $scope.profile.fineweight =  ($scope.profile.fine ) * $scope.profile.grossweight/100;
      console.log($scope.profile);
      PostService.async("/insertData/issue",$scope.profile).then(function(response){
      console.log(response);
        if(response.data=="Success"){
          $scope.profile.date = $scope.profile.date.getFullYear()+"-"+$scope.profile.date.getMonth()+"-"+$scope.profile.date.getDate();
          DataPasser.setData($scope.profile);
          $rootScope.$emit("dataInserted");
        }
      },function(error){
      console.log(error);
      })

      $mdDialog.hide();
      }
  $scope.close = function(){
    $mdDialog.hide();;
  }


});

control.controller('receipt',function($scope,DataPasser,GetService,$rootScope,$mdDialog){
  $scope.profiles=[];
  $scope.mainData=[];
  $scope.profile = DataPasser.getData();
  $scope.fineWeight=0;
  $scope.data={};
  $scope.name =   DataPasser.getData().name;
  var calcFineWeight = function(){
    $scope.fineWeight ="";
    var temp=0; 
    for(var i=0;i<$scope.profiles.length;i++){
      temp = temp + $scope.profiles[i].fineweight;
    }
    $scope.fineWeight = temp;
    
  }
  
  GetService.async("/getProfileDataReceipt/"+$scope.name).then(function(response){
    $scope.profiles=response.data;
    $scope.mainData = response.data;
    
    calcFineWeight();
    },function(error){
    console.log(error);
  })
  
  $scope.showAdvanced = function(ev) {
    $mdDialog.show({
      controller: 'Receiptmodalcontrol',
      templateUrl: 'js/receipt-dialogue.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
  }
    
  $scope.getDate =function(date){
    var newDate = new Date(date.substring(0,10));
    return newDate.getDate() +"/" + (newDate.getMonth()+1) +"/" + newDate.getFullYear().toString().substring(2,4);
  }

  var getNewObject =function(model){
    var profile = {
      date:model.date,
      grossweight:model.grossweight,
      fine:model.fine,
      comment:model.comment,
      fineweight:model.fineweight,
      wastage:model.wastage
    };
    return profile;  
  }
     
  $rootScope.$on("dataReceiptInserted", function(data){
    $scope.profiles.push(getNewObject(DataPasser.getData()));
    $scope.fineWeight = $scope.fineWeight + DataPasser.getData().fineweight;
  });
  $scope.sortDate = function(){
        if($scope.data.to == null || $scope.data.from ==null ){
          return;
        }
        var formDate = new Date($scope.data.from.toString());
        formDate.setHours(5);
        formDate.setMinutes(30);

        var toDate = new Date($scope.data.to.toString());
        var dataSet = $scope.mainData;
        console.log(toDate);
        toDate.setHours(5);
        toDate.setMinutes(30);
       
        
        $scope.profiles=[];
        for(var i =0;i<dataSet.length ;i++){
          var compare = new Date(dataSet[i].date.substring(0,10));
          console.log(compare);
          if(compare >=formDate &&  compare<=toDate){
            $scope.profiles.push(dataSet[i]);
          }
        }
        calcFineWeight();

      }


});

control.controller('Receiptmodalcontrol' ,function($scope,$mdDialog,PostService,DataPasser,$rootScope){
  $scope.profile = {
    grossweight:'',
    fine:'',
    comment:'',
    date:'',
    wastage:''
  };
  $scope.profile.name = DataPasser.getData().name;
  
  $scope.hello = function(){
      for(var a in $scope.profile){
        console.log(a);
        if($scope.profile[a] == '' && a !='comment'){
          alert("Please fill " + a);
          return;  
        }
      }
      if($scope.profile.fine >100){
        alert("Fine is in Percentage");
        return;
      }


      $scope.profile.fineweight =  (($scope.profile.fine +$scope.profile.wastage) * $scope.profile.grossweight )/100;
      console.log($scope.profile);

      PostService.async("/insertData/receipt",$scope.profile).then(function(response){
      console.log(response);
        if(response.data=="Success"){
          
          
          $scope.profile.date = $scope.profile.date.getFullYear()+"-"+$scope.profile.date.getMonth()+"-"+$scope.profile.date.getDate();
          DataPasser.setData($scope.profile);
          $rootScope.$emit("dataReceiptInserted",{});
        }
      },function(error){
      console.log(error);
      })

      $mdDialog.hide();
      }
  $scope.close = function(){
    $mdDialog.hide();;
  }


});

