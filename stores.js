var BSON = require('bson');
var db = { };

exports.setDB = function(incomingDd) {
    db = incomingDd;
};

exports.getStores = function(httpRequest, httpResponse) {
    var searchQuery = { };

    var category = httpRequest.query.category;
    var storename = httpRequest.query.storename;

    if(category)
        searchQuery.category = category;
    if(storename)
        searchQuery.storename = storename;

    db.collection('stores').find(searchQuery).sort({'storename': 1}).toArray().then(function(data){
        httpResponse.send({'stores': data});
    });
};

exports.getStore = function(httpRequest, httpResponse) {
    var searchQuery = { };
    var id = httpRequest.query.id;

    if(id)
        searchQuery = { '_id': new BSON.ObjectID(id)};
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
        return;
    }
    
    db.collection('stores').findOne(searchQuery).then(function(data){
        if(data) {
            httpResponse.send(data);
        }
        else {
            httpResponse.status(404);
            httpResponse.send('Store not found.');
        }
    });
};

exports.addStore = function(httpRequest, httpResponse) {
    var store = httpRequest.body;
    if(store.storename) {
        if(store._id) {
            store._id = new BSON.ObjectID(store._id);
        }
        db.collection('stores').insert(store, {safe:true}, function(err, result) {
            if (err) {
                httpResponse.status(500);
                httpResponse.send('An error has occurred.');
            }
            else {
                httpResponse.send(result.ops[0]);
            }
        });
    }
    else {
        httpResponse.status(403);
        httpResponse.send('Store name not provided.');
    }
};

exports.deleteStore = function(httpRequest, httpResponse) {
    var id = httpRequest.query.id;
    if(id) {
        var searchQuery = { '_id': new BSON.ObjectID(id)};
        db.collection('stores').findOne(searchQuery).then(function(data){
            if(data) {
                //Found
                //Remove all reviews of store

                //Remove store
                db.collection('stores').remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
                    if (err) {
                        httpResponse.status(500);
                        httpResponse.send('An error has occurred.');
                    }
                    else {
                        httpResponse.send('Store has been deleted.');
                    }
                });
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('Store not found.');
            }
        });
    }
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
    }
};

exports.updateStore = function(httpRequest, httpResponse) {
    var store = httpRequest.body;
    var id = httpRequest.query.id;
    if(id) {
        var searchQuery = { '_id': new BSON.ObjectID(id)};
        db.collection('stores').findOne(searchQuery).then(function(data){
            if(data) {
                //Found
                store._id = searchQuery._id;
                if(!store.storename)
                    store.storename = data.storename;
                if(!store.category)
                    store.category = data.category;
                if(!store.Address)
                    store.Address = data.Address;

                db.collection('stores').update(searchQuery, store, function(err, result) {
                    if (err) {
                        httpResponse.status(500);
                        httpResponse.send('An error has occurred.');
                    }
                    else {
                        httpResponse.send(store);
                    }
                });
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('Store not found.');
            }
        });
    }
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
    }
};