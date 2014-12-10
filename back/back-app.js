/* Init and return synth app */

var synth = require('synth')
  , google = require('googleapis')
  , bodyParser = require('body-parser')
  , expressJwt = require('express-jwt')
  , jwt = require('jsonwebtoken')
  , db = require('promised-mongo')(process.env.MONGODB || 'patremoniumbeheer')
  , app = synth.app;
app.use(bodyParser.json());
var secret = "5487eertyu5541554887rrtrt_AB0_ZZQVà";
app.use('/api', expressJwt({secret: secret}));

module.exports = require('synth')();
app.post('/authenticate', function (req, res) {
  var plus = google.plus('v1');
  var OAuth2 = google.auth.OAuth2;
  var client_id = '273207854014-32vo8nirrr75jti027sub8d92secgccc.apps.googleusercontent.com';
  var client_secret = '_ejvUbbHFfaxgIUeLAcr-bj_';
  var redirect_url = 'postmessage';
  var oauth2Client = new OAuth2(client_id, client_secret, redirect_url);
  var code = req.body.authResult;
  oauth2Client.getToken(code, function(err, tokens) {
      if(err)console.log(err);
      oauth2Client.setCredentials(tokens); 
      plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
        if (err) console.log(err);
        response.accesstoken = code;
        var token = jwt.sign(response, secret, { expiresInMinutes: 60*5 });        
        db.collection('users').update({
          googleid: response.id
        }, {$set: {googleid: response.id, google: response}}, {upsert:true}).then(function(err){
          if (err) console.log(err);
        });             
        db.collection('users').findOne({googleid:response.id}).then(function(user){
          res.json({ response: user, token: token});  
        });
      });  
  });
});

