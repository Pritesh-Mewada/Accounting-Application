var express  = require('express');
var BodyParser = require('body-parser');
var mongodb = require('mongodb');
var assert = require('assert');

var app = express();
app.use(BodyParser());
app.use(express.static('public'));

app.get('/',function(req,res){

});

app.post('/create',function(req,response){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  
  console.log(req.body);
  
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  
  var collection = db.collection('profile');
    collection.insert(req.body,function(err,res){
      if(err){
        console.log("error in insert");
        response.send("Error");
      }else{
        console.log("Success in insert");
        response.send("Success");
        db.close();
      }
    })
  });
});

app.post('/insertData/:type',function(req,response){
  
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  console.log(req.body);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  req.body.type = req.params.type;
  console.log("Connected successfully to server");
  var collection = db.collection(req.body.name);
    collection.insert(req.body,function(err,res){
      if(err){
        console.log("error in insert");
        response.send("Error");
      }else{
        console.log("Success in insert");
        response.send("Success");
        db.close();
      }
    
    })
  });
});
app.post('/updateData',function(req,response){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  console.log(req.body);
  MongoClient.connect(url, function(err, db) {
  console.log("Connected successfully to server");
  var collection = db.collection(req.body.name);
    collection.update({"_id":require('mongodb').ObjectID(req.body.id)},req.body,function(err,res){
      if(err){
        console.log("error in insert");
        console.log(err);
        response.send("Error");

      }else{
        console.log("Success in insert");
        response.send("Success");
        db.close();
      }
    });
  });
});

app.get('/profiles',function(req,response){
  
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  console.log(req.body);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  var collection = db.collection('profile');
    collection.find({}).toArray(function(error,result){
      response.send(result);
    })
  })
});

app.post('/delete/:profile',function(req,response){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  console.log(req.body);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  var collection = db.collection(req.params.profile);
    collection.remove({"_id":require('mongodb').ObjectID(req.body.id)},function(err,res){
      if(err){
        response.send("Error");
      }else{
        response.send("Success");
      }
    })
  })
});

app.get('/getProfileDataIssue/:name',function(req,response){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  console.log(req.body.profile);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  var collection = db.collection(req.params.name);
    collection.find({"type":"issue"}).toArray(function(error,result){
      response.send(result);
    })
  })
});

app.get('/getProfileDataReceipt/:name',function(req,response){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  console.log(req.body.profile);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  var collection = db.collection(req.params.name);
    collection.find({"type":"receipt"}).toArray(function(error,result){
      response.send(result);
    })
  })
});


app.get('/test',function(req,res){
  res.send("hello");
});


app.get('/all/:name',function(req,response){
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/nilashish';
  //console.log(req.body.profile);
  MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  var collection = db.collection(req.params.name);
    collection.find({},{type:1,date:1,fineweight:1}).toArray(function(error,result){
      response.send(result);
    })
  })
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '192.168.0.8';
app.listen(server_port,server_ip_address,()=>{
  console.log("hello i am started");
})
