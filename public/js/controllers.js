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
        console.log(response.data);
        $scope.profiles = response.data;
    },function (error) {
        console.log(error);
    })
    $scope.GoToCreate = function () {
        $state.go("createprofile")
    }

    $scope.goToEvaluate=function(profile){
      // $scope.profiles[index].visible = !$scope.profiles[index].visible;
      // console.log($scope.profiles[index].visible)
      DataPasser.setData(profile);
      $state.go('evaluate');      
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

control.controller('receipt',function($scope,$mdDialog,DataPasser,PostService,GetService,$rootScope,PrintPasser,$state){
    $scope.mainData=[];
    $scope.profiles=[];
    $scope.data={};
    $scope.data.visible = false;
    $scope.customFullscreen = false;
    $scope.name = DataPasser.getData().name;
    var dataset = {
      name:DataPasser.getData().name,
      type:'issue'
    }
    $scope.showConfirm = function(ev,iid,index) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Would you like to delete your Issue?')
          .textContent('Selected Entry will be deleted')
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Please do it!')
          .cancel('Nope i am playing');

      $mdDialog.show(confirm).then(function() {
        $scope.delete(iid,index);
      }, function() {
        
      });
    };

    $scope.print = function(){
      var dataset ={
        data:$scope.profiles,
        show:"issue"
      }
      PrintPasser.setData(dataset);
      $state.go('print');
    }

    DataPasser.setData(dataset);
    $scope.modifyEnable=function(){
      $scope.data.visible = true;
    }   
    $scope.edit =function(data,indexing){
      if($scope.data.visible ==false){
        return;
      }
      
      
      var dataset = {
        name: DataPasser.getData().name,
        update:true,
        profile:data,
        index:indexing
      }
      DataPasser.setData(dataset);
      $scope.showAdvanced();
    }
    
    $scope.delete = function(iid,index){
      console.log("Delete index :  "+index+"Having id: "+iid);
      $scope.profiles.splice(index, 1);
      var data ={
        id:iid
      }
      calcFineWeight();
      PostService.async('/delete/'+$scope.name,data).then(function(response){
        console.log(response);
        if(response){
          console.log("data deleted");

        }
      },function(error){
        if(error){
          console.log("error");
        }
      })
    }
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
          templateUrl: 'js/receipt-dialogue.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
    }

    $scope.getDate = function(date){
      if(date ===undefined){
        return;
      }
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
          _id:model.id,
          type:model.type,
          name:model.name,
          index:model.index,
          return:model.return
        };
        return profile;
    }

     $rootScope.$on("dataInserted", function(data){
        $scope.profiles.push(getNewObject(DataPasser.getData()));
        $scope.fineWeight = $scope.fineWeight + DataPasser.getData().fineweight;
        DataPasser.setData(dataset);
      });

     $rootScope.$on("dataUpdated", function(data){
        var temp=getNewObject(DataPasser.getData());
        $scope.profiles[DataPasser.getData().index]=temp;
        DataPasser.setData(dataset);
      
      });
     var getStandard = function(newDate){
        return newDate.getFullYear().toString()+"-"+(newDate.getMonth()) +"-" + newDate.getDate();
      }

     $scope.sortDate = function(){
        if($scope.data.to == null || $scope.data.from ==null ){
          return;
        }
        var formDate = new Date($scope.data.from.toString());
        var toDate = new Date($scope.data.to.toString());
        var dataSet = $scope.mainData;
        $scope.profiles=[];
        for(var i =0;i<dataSet.length ;i++){
          var compare = new Date(dataSet[i].date);
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
    dateInput:''
  };
  
  if(DataPasser.getData().update==true){
    $scope.profile.grossweight=DataPasser.getData().profile.grossweight;
    $scope.profile.fine=DataPasser.getData().profile.fine;
    $scope.profile.comment=DataPasser.getData().profile.comment;
    $scope.profile.dateInput = new Date(DataPasser.getData().profile.date.toString());
    $scope.profile.id=DataPasser.getData().profile.id;
    $scope.profile.index = DataPasser.getData().index;
    $scope.profile.type=DataPasser.getData().profile.type;
    $scope.profile.wastage=DataPasser.getData().profile.wastage;
    $scope.profile.name = DataPasser.getData().name;
  }else{
    $scope.profile.name = DataPasser.getData().name;
    $scope.profile.type = DataPasser.getData().type;
  }

  $scope.hello = function(){

      for(var a in $scope.profile){
        if($scope.profile[a] == '' && a !='comment' && a !='index' ){
          alert("Please fill " + a);
          return;
        }
      }
      
      if($scope.profile.fine >100){
        alert("Fine is in Percentage");
        return;
      }

      if($scope.profile.type=='receipt'){
          $scope.profile.fineweight =  (($scope.profile.fine +$scope.profile.wastage) * $scope.profile.grossweight )/100;
      }else{
          $scope.profile.fineweight =  (($scope.profile.fine +$scope.profile.return) * $scope.profile.grossweight )/100;
      }
      
      $scope.profile.date = $scope.profile.dateInput.getFullYear()+"-"+($scope.profile.dateInput.getMonth()+1)+"-"+$scope.profile.dateInput.getDate()
      if(DataPasser.getData().update==true){
        PostService.async("/updateData",$scope.profile).then(function(response){
          if(response.data=="Success"){
            DataPasser.setData($scope.profile);
            if($scope.profile.type=='issue'){
              $rootScope.$emit("dataUpdated");
            }else{
              $rootScope.$emit("dataReceiptUpdated");
            }

          }
        },function(error){
          console.log(error);
        });

      }else{
        PostService.async("/insertData/"+$scope.profile.type,$scope.profile).then(function(response){
          if(response.data=="Success"){
            DataPasser.setData($scope.profile);

            if($scope.profile.type=='issue'){
                $rootScope.$emit("dataInserted");
            }else{
              $rootScope.$emit("dataReceiptInserted");
            }
          }
        },function(error){
        console.log(error);
        });
      }



      $mdDialog.hide();
      }

  $scope.close = function(){
    $mdDialog.hide();

  }


});

control.controller('issue',function($scope,DataPasser,GetService,$rootScope,$mdDialog,PostService,$state,PrintPasser){
  $scope.profiles=[];
  $scope.mainData=[];
  $scope.profile = DataPasser.getData();
  $scope.fineWeight=0;
  $scope.data={};
  $scope.data.visible = false;
  $scope.name =   DataPasser.getData().name;
  $scope.modifyEnable=function(){
    $scope.data.visible = true;
  }

  $scope.showConfirm = function(ev,iid,index) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('Would you like to delete your Issue?')
          .textContent('Selected Entry will be deleted')
          .ariaLabel('Lucky day')
          .targetEvent(ev)
          .ok('Please do it!')
          .cancel('Nope i am playing');

      $mdDialog.show(confirm).then(function() {
        $scope.delete(iid,index);
      }, function() {
        
      });
    };


    $scope.print = function(){
      var dataset ={
        data:$scope.profiles,
        show:"receipt"
      }
      PrintPasser.setData(dataset);
      $state.go('print');
    } 

  var calcFineWeight = function(){
    $scope.fineWeight ="";
    var temp=0;
    for(var i=0;i<$scope.profiles.length;i++){
      temp = temp + $scope.profiles[i].fineweight;
    }
    $scope.fineWeight = temp;
  }
  $scope.name = DataPasser.getData().name;
  var dataset = {
    name:DataPasser.getData().name,
    type:'receipt'
  }
  DataPasser.setData(dataset);
  $scope.edit =function(data,indexing){
      if($scope.data.visible==false){
        return;
      }
      data.id = data._id;
      var dataset = {
        name: DataPasser.getData().name,
        update:true,
        profile:data,
        index:indexing
      }

      DataPasser.setData(dataset);
      console.log(dataset);
      $scope.showAdvanced();
    }

  $scope.delete = function(iid,index){
      console.log("Delete index :  "+index+"Having id: "+iid);
      $scope.profiles.splice(index, 1);
      var data ={
        id:iid
      }
      calcFineWeight();
      PostService.async('/delete/'+$scope.name,data).then(function(response){
        console.log(response);
        if(response){
          console.log("data deleted");

        }
      },function(error){
        if(error){
          console.log("error");
        }
      })
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
        fineweight:model.fineweight,
        _id:model.id,
        type:model.type,
        name:model.name,
        index:model.index,
        wastage:model.wastage

      };
      return profile;
  }


  $rootScope.$on("dataReceiptInserted", function(data){
    
    $scope.profiles.push(getNewObject(DataPasser.getData()));
    $scope.fineWeight = $scope.fineWeight + DataPasser.getData().fineweight;
  
  });
  $rootScope.$on("dataReceiptUpdated", function(data){
    var temp=getNewObject(DataPasser.getData());
    $scope.profiles[DataPasser.getData().index]=temp;
   });
  $scope.sortDate = function(){
        if($scope.data.to == null || $scope.data.from ==null ){
          return;
        }
        var formDate = new Date($scope.data.from.toString());
        var toDate = new Date($scope.data.to.toString());
        var dataSet = $scope.mainData;
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


}).controller('evaluate',function($scope,GetService,DataPasser,$state,PrintPasser){
  $scope.data={};
  $scope.name = DataPasser.getData().name;
  console.log($scope.name);
  GetService.async('/all/'+$scope.name).then(function (response) {
        console.log(response.data);
        $scope.profiles = response.data;
        $scope.mainData = response.data;
        calcFineWeight();
      },function (error) {
        console.log(error);
    
  });
  $scope.print = function(){
      var dataset ={
        data:$scope.profiles,
        show:"evaluate"
      }
      PrintPasser.setData(dataset);
      $state.go('print');
    }

  $scope.getDate =function(date){
    var newDate = new Date(date.substring(0,10));
    return newDate.getDate() +"/" + (newDate.getMonth()+1) +"/" + newDate.getFullYear().toString().substring(2,4);
  }

  var calcFineWeight =function(){
    
    var dataset =  $scope.profiles;
    var receipt = 0;
    var issue = 0;
    console.log("i am called");
    for(var i=0;i<dataset.length;i++){
      if(dataset[i].type =="issue"){
        
        issue = issue + dataset[i].fineweight;
      }else if(dataset[i].type=='receipt'){
        receipt = receipt + dataset[i].fineweight;
      }
    }
    $scope.fineWeight = receipt-issue;
  }

  $scope.sortDate = function(){
        if($scope.data.to == null || $scope.data.from ==null ){
          return;
        }
        var formDate = new Date($scope.data.from.toString());
        var toDate = new Date($scope.data.to.toString());
        var dataSet = $scope.mainData;
        $scope.profiles=[];
        for(var i =0;i<dataSet.length ;i++){
          var compare = new Date(dataSet[i].date.substring(0,10));
          if(compare >=formDate &&  compare<=toDate){
            $scope.profiles.push(dataSet[i]);
          }
        }
        calcFineWeight();
    }



}).controller('print',function($scope,PrintPasser){
  $scope.show="";
  $scope.profiles = PrintPasser.getData().data;
  $scope.show = PrintPasser.getData().show;
  console.log(PrintPasser.getData());
  $scope.getDate = function(date){
      if(date ===undefined){
        return;
      }
      var newDate = new Date(date.substring(0,10));
      return newDate.getDate() +"/" + (newDate.getMonth()+1) +"/" + newDate.getFullYear().toString().substring(2,4);
    }
});
