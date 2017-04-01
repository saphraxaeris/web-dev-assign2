var BSON = require('bson');
var db = { };

exports.setDB = function(incomingDd) {
    db = incomingDd;
};

exports.getReview = function(httpRequest, httpResponse) {
    var searchQuery = { };
    var id = httpRequest.query.id;
    var userID = httpRequest.query.userID;
    var storeID = httpRequest.query.storeID;

    if(id)
        searchQuery = { '_id': new BSON.ObjectID(id)};
    else if(userID)
        searchQuery = { 'userID': new BSON.ObjectID(userID)};
    else if(storeID)
        searchQuery = { 'storeID': new BSON.ObjectID(storeID)};
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
        return;
    }
    
    if(id) {
        db.collection('reviews').findOne(searchQuery).then(function(data){
            if(data) {
                httpResponse.send(data);
            }
            else {
                httpResponse.status(404);
                httpResponse.send('Review not found.');
            }
        });
    }
    else {
        db.collection('reviews').find(searchQuery).toArray().then(function(data){
            if(data) {
                httpResponse.send({'reviews': data});
            }
            else {
                httpResponse.status(404);
                httpResponse.send('Store or user id not found.');
            }
        });
    }
};

exports.addReview = function(httpRequest, httpResponse) {
    var review = httpRequest.body;
    if(review.userID && review.storeID && review.rating) {
        if(review._id) {
            review._id = new BSON.ObjectID(review._id);
        }        

        review.userID = new BSON.ObjectID(review.userID);
        review.storeID = new BSON.ObjectID(review.storeID);

        if (review.rating === parseInt(review.rating, 10)) {
            //Is an integer, must verify if between 0 and 10
            review.rating = parseInt(review.rating);
            if(review.rating >=0 && review.rating <= 10) {
                var searchQuery = { };
                searchQuery = { '_id': new BSON.ObjectID(review.storeID)};
                db.collection('stores').findOne(searchQuery).then(function(data){
                    if(data) {
                        searchQuery = { 'userID': new BSON.ObjectID(userID)};
                        db.collection('reviews').find(searchQuery).toArray().then(function(data){
                            if(data) {
                                data.forEach(function(item){
                                    if(item.userID === userId) {
                                        httpResponse.status(500);
                                        httpResponse.send('User already has review for this store.');
                                    }
                                    else {
                                        db.collection('reviews').insert(review, {safe:true}, function(err, result) {
                                            if (err) {
                                                httpResponse.status(500);
                                                httpResponse.send('An error has occurred.');
                                            }  
                                            else {
                                                httpResponse.send(result.ops[0]);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                db.collection('reviews').insert(review, {safe:true}, function(err, result) {
                                    if (err) {
                                        httpResponse.status(500);
                                        httpResponse.send('An error has occurred.');
                                    }  
                                    else {
                                        httpResponse.send(result.ops[0]);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        httpResponse.status(500);
                        httpResponse.send('Store not found.');
                    }
                });
            }
            else {
                //Rating is not between [0,10]
                httpResponse.status(403);
                httpResponse.send('Rating provided was incorrect.');
            }
        }
        else {
            //Rating is not an integer
            httpResponse.status(403);
            httpResponse.send('Rating provided was incorrect.');
        }
    }
    else {
        httpResponse.status(403);
        httpResponse.send('Review userID, storeID, or rating not provided.');
    }
};

exports.deleteReview = function(httpRequest, httpResponse) {
    var id = httpRequest.query.id;
    var storeId = httpRequest.query.storeid;
    var userId = httpRequest.query.userid;

    if(id) {
        var searchQuery = { '_id': new BSON.ObjectID(id)};
        db.collection('stores').findOne(searchQuery).then(function(data){
            if(data) {
                db.collection('reviews').remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
                    if (err) {
                        httpResponse.status(500);
                        httpResponse.send('An error has occurred.');
                    }
                    else {
                        httpResponse.send('Review has been deleted.');
                    }
                });
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('Review not found.');
            }
        });
    }
    else if(storeId) {
        var searchQuery = { 'storeID': new BSON.ObjectID(storeId)};
        db.collection('reviews').find(searchQuery).toArray().then(function(data){
            if(data) {
                var worked = true;
                var count = 0;
                data.forEach(function(item){
                    db.collection('reviews').remove({'storeID': new BSON.ObjectID(storeId)}, {safe:true}, function(err, result) {
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
                httpResponse.send('Store ID not found.');
            }
        });
    }
    else if(userId) {
        var searchQuery = { 'userID': new BSON.ObjectID(userId)};
        db.collection('reviews').find(searchQuery).toArray().then(function(data){
            if(data) {
                var worked = true;
                var count = 0;
                data.forEach(function(item){
                    db.collection('reviews').remove({'userID': new BSON.ObjectID(userId)}, {safe:true}, function(err, result) {
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
    }
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
    }
};

exports.updateReview = function(httpRequest, httpResponse) {
    var review = httpRequest.body;
    var id = httpRequest.query.id;
    if(id) {
        var searchQuery = { '_id': new BSON.ObjectID(id)};
        db.collection('reviews').findOne(searchQuery).then(function(data){
            if(data) {
                //Found
                review._id = searchQuery._id;
                if(!review.storeID)
                    review.storeID = data.storeID;
                if(!review.userID)
                    review.userID = data.userID;
                if(!review.rating)
                    review.rating = data.rating;
                else {
                    if (review.rating === parseInt(review.rating, 10)) {
                        //Is an integer, must verify if between 0 and 10
                        review.rating = parseInt(review.rating);
                        if(review.rating <=0 && review.rating >= 10) {
                            review.rating = data.rating;
                        }
                    }
                }
                if(!review.comment)
                    review.comment = data.comment;

                db.collection('reviews').update(searchQuery, review, function(err, result) {
                    if (err) {
                        httpResponse.status(500);
                        httpResponse.send('An error has occurred.');
                    }
                    else {
                        httpResponse.send(review);
                    }
                });
            }
            else {
                //Not found
                httpResponse.status(404);
                httpResponse.send('Review not found.');
            }
        });
    }
    else {
        httpResponse.status(500);
        httpResponse.send('Invalid method.');
    }
};