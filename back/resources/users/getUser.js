exports.get = function (db, params) {
  return db.collection('users').findOne({googleid: params.id}).then(function (user) {
    return {
      user: user
    };
  });
};

exports.getIndex = function(db) {
  return db.collection('users').find().toArray().then(function(users){
    // docs is an array of all the documents in mycollection
   return users;
  });
};


