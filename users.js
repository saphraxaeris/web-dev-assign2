var BSON = require('bson');
var db = { };

exports.setDB = function(incomingDd) {
    db = incomingDd;
};

exports.getUsers = function(httpRequest, httpResponse) {
    var searchQuery = { };

    var firstName = httpRequest.query.firstname;
    var lastName = httpRequest.query.lastname;
    var age = httpRequest.query.age;
    var sex = httpRequest.query.sex;

    if(firstName)
        searchQuery.firstname = firstName;
    if(lastName)
        searchQuery.lastname = lastName;
    if(age)
        searchQuery.age = parseInt(age);
    if(sex)
        searchQuery.sex = sex;

    db.collection('users').find(searchQuery).sort({'username': 1}).toArray().then(function(data){
        httpResponse.send({'users': data});
    });
};

exports.getUser = function(httpRequest, httpResponse) {
    var searchQuery = { };
    var id = httpRequest.query.id;
    var userName = httpRequest.query.username;

    if(id)
        searchQuery = { '_id': new BSON.ObjectID(id)};
    else if(userName)
        searchQuery = {'username': userName};
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
        return;
    }
    
    db.collection('users').findOne(searchQuery).then(function(data){
        if(data) {
            httpResponse.send(data);
        }
        else {
            httpResponse.status(404);
            httpResponse.send('User not found.');
        }
    });
};

exports.addUser = function(httpRequest, httpResponse) {
    var user = httpRequest.body;

    if(user.username) {
        //Check if username already exists
        db.collection('users').findOne({'username': user.username}).then(function(data){
            if(!data) {
                if(user._id) {
                    user._id = new BSON.ObjectID(user._id);
                }
                db.collection('users').insert(user, {safe:true}, function(err, result) {
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
                httpResponse.send('Username exists or was not sent.');
            }
        });
    }
    else {
        httpResponse.status(403);
        httpResponse.send('Username exists or was not sent.');
    }
};

exports.deleteUser = function(httpRequest, httpResponse) {
    var id = httpRequest.query.id;
    if(id) {
        var searchQuery = { '_id': new BSON.ObjectID(id)};
        db.collection('users').findOne(searchQuery).then(function(data){
            if(data) {
                //Found
                var searchQuery = { 'userID': new BSON.ObjectID(id)};
        db.collection('reviews').find(searchQuery).toArray().then(function(data){
            if(data) {
                var worked = true;
                var count = 0;
                data.forEach(function(item){
                    db.collection('reviews').remove({'userID': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
                        if (err) {
                            worked = false;
                        }
                        else {
                            count++;
                        }
                    });
                });

                if(worked) {
                    httpResponse.send(count + ' reviews have been deleted.');
                }
                else {
                    httpResponse.status(500);
                    httpResponse.send('An error has occurred. Not all reviews might have been deleted. ' + count + ' revies were deleted.');
                }
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('User ID not found.');
            }
        });

                //Remove user
                db.collection('users').remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
                    if (err) {
                        httpResponse.status(500);
                        httpResponse.send('An error has occurred.');
                    }
                    else {
                        httpResponse.send('User has been deleted.');
                    }
                });
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('User not found.');
            }
        });
    }
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
    }
};

exports.updateUser = function(httpRequest, httpResponse) {
    var user = httpRequest.body;
    var id = httpRequest.query.id;
    if(id) {
        var searchQuery = { '_id': new BSON.ObjectID(id)};
        db.collection('users').findOne(searchQuery).then(function(data){
            if(data) {
                //Found
                user._id = searchQuery._id;
                user.username = data.username;
                if(!user.firstname)
                    user.firstname = data.firstname;
                if(!user.lastname)
                    user.lastname = data.lastname;
                if(!user.sex)
                    user.sex = data.sex;
                if(!user.age)
                    user.age = data.age;

                db.collection('users').update(searchQuery, user, function(err, result) {
                    if (err) {
                        httpResponse.status(500);
                        httpResponse.send('An error has occurred.');
                    }
                    else {
                        httpResponse.send(user);
                    }
                });
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('User not found.');
            }
        });
    }
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
    }
};