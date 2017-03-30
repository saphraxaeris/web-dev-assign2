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

