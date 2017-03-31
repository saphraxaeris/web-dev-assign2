//Initialze
var express = require('express');
var expressApp = express();
var path = require('path');
var bodyParser = require('body-parser');

var users = require('./users');
var stores = require('./stores');
var reviews = require('./reviews');

var mongo = require('mongodb');

//Set up resources
expressApp.use(express.static('assets'));
expressApp.use(express.static('styles'));
expressApp.use(express.static('scripts'));
expressApp.use(bodyParser.json());

//Set up MongoDB
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('assignmentdb', server);

db.open(function(err, db) {
    if(!err) {
        //Reference db from modules
        users.setDB(db);
        stores.setDB(db);
        reviews.setDB(db);
    }
});

//Index Page
expressApp.get('/', function(httpRequest, httpResponse) {
    httpResponse.sendFile(path.join(__dirname+'/index.html'));
});

//Users
expressApp.get('/users', users.getUsers);
expressApp.get('/user', users.getUser);
expressApp.post('/user', users.addUser);
expressApp.delete('/user', users.deleteUser);
expressApp.put('/user', users.updateUser);

//Stores
expressApp.get('/stores', stores.getStores);
expressApp.get('/store', stores.getStore);
expressApp.post('/store', users.addStore);
expressApp.delete('/store', users.deleteStore);
expressApp.put('/store', users.updateStore);

//Reviews
expressApp.get('/review', stores.getReview);
expressApp.post('/review', stores.addReview);
expressApp.delete('/review', stores.deleteReview);


//Start server
expressApp.listen(3000);