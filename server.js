//Build a Voting App
//FCC API Basejump: Build a Voting App
'use strict';
var mongo = require('mongodb');
var assert = require('assert');

var ejs = require('ejs');

var express = require('express');

var app = express();

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var validator = require("email-validator");

var shortid = require('shortid');

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

var urlmLab = process.env.MONGOLAB_URI;

mongo.MongoClient.connect(urlmLab || 'mongodb://localhost:27017/code101', function(err, db) { 
 if (err) { 
     throw new Error('Database failed to connect.'); 
   } else { 
     console.log('Successfully connected to MongoDB.'); 
   } 

db.createCollection("pollsappdb", { 
     capped: true, 
     size: 5242880, 
     max: 5000 
   }); 

app.set('view engine', 'ejs');

////////////

app.use(morgan('dev')); // logger
app.use(cookieParser()); // for authencating
//app.use(bodyParser()); 


app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.use('/', express.static(process.cwd() + '/')); 
      
var port = process.env.PORT || 8080; 
var secret = process.env.SECRET;

app.use(session({ secret: secret }));

// index page
    app.get('/', function(req, res) {
        res.render('pages/index.ejs'); // load the index.ejs file
    });

//
app.get('/chart', function(req, res){
  getChartData(res);
});

//////

app.get('/addVote', function(req, res){
  //getChartData(res);
  var user1 = req.session.user;
    
    console.log("user is " + user1);
    var user = req.session.user || 0;
    console.log("USER: " + user);
    var myOption = req.body.option;
   console.log("Option " + myOption);
    var choice_input = req.body.choice_input || 0;
    console.log (choice_input);
    var add_option = req.body.add_option  || 0;
    var add_vote = req.body.add_vote || 0;
    var title = req.body.title;
    var url = req.body.url;
   
   console.log("add_option " + add_option);
   console.log("add_vote " + add_vote);
   console.log("title " + title);
   console.log("url " + url);
  console.log("User Option picked: " + choice_input);
    var tagline = "Added Your Poll: ";
    
    var qPollObj = {};    
        qPollObj = { 
                 "url": url,
                 "user1": user1,
                 "title": title,
                 "option": choice_input,
                 "votescore": 0
               }; 
    res.render('pages/pollView', {
                "origurl": "", 
                "test": "",  
                poll: qPollObj,
                user: user,
                "error": "Wrong URL website address, please check again!",
                tagline: tagline
                });
    
})

//////
    app.post("/addVote", function (req, res) {
    var user1 = req.session.user;
    
    console.log("user is " + user1);

   var user = req.session.user || 0;
    console.log("USER: " + user);
    
   //var ip = req.ip;
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
    
    console.log("IP: " + ip);
    
    var myOption = req.body.option;
   console.log("Option " + myOption);
    var choice_input = req.body.choice_input || 0;
    console.log ("choice_input"+ choice_input);
    var add_option = req.body.add_option  || 0;
    var add_vote = req.body.add_vote || 0;
    var title = req.body.title;
    var url = req.body.url;
    
    var tagline = "Added Your Poll: ";
    
    var fullUrl = req.protocol + '://' + req.get('host') + "/pollView/"+url;       
   
   console.log("add_option " + add_option);
   console.log("add_vote " + add_vote);
   console.log("title " + title);
   console.log("url " + url);
  console.log("User Option picked: " + choice_input);
   
    var qPollObj = {};
    var qVoterObj = {};
    var qVoteObj = {};
    var qScoreObj = {};
    
    
     if ( myOption === 0 || myOption === 1){
      // redirect back to polls or user polls - no correct option selected.
       // res.send(qPollObj); 
       console.log("user" + user + " and 111 " + choice_input);
        console.log("Here not reged!");
        console.log("Here again!");
    res.redirect('/'); 
    }
    else if ( user === 0 &&  add_option == 1 ){
      // redirect back to polls or user polls - no correct option selected.
       // res.send(qPollObj); 
       console.log("user" + user + " and 111 " + choice_input);
        console.log("Here not reged!");
        console.log("Here again!");
    res.redirect('/'); 
    }
    
    else if (add_option == 1 ) {
        console.log("Here!");
        
        qPollObj = { 
         "url": url,
         "user1": user1,
         user: user,
         "title": title,
         "option": choice_input,
         "votescore": 1
       }; 
      // update options choice in db and set vote for user to 1.
      
      updateVoteOptions(qPollObj,res,db, function(result) {
            if(result)
            {
                console.log("update: "+ result);
                
            getYourPolls(qPollObj,res,db, function(result) {
            if(result)
            {
                res.redirect('/pollView/'+url); 
            }

          });
                 
            }
            else{
             res.render('pages/pollView', {
                poll: "",
                user: user,
                twurl: fullUrl,
                error: "Failed",
                tagline: "polls"
            });
            }

    });
      
      //res.send(qPollObj); 
    }
    else if(add_vote == 1){
        
          console.log("Here2!");
          if (myOption == 0 || myOption == 1 ){
               console.log("Here2!");
      // redirect back to polls or user polls - no correct option selected.
       // res.send(qPollObj); 
    res.redirect('/pollView/'+url); 
    }
        // save vote to db and redirect back with chart.
        user1 = req.session.user || ip;
        console.log("user1 id is : "+ user1);
        qVoterObj = { 
         "url": url,
         "user1": user1,
         "title": title,
         "option": myOption,
         "votescore": 1
         };
         
         qScoreObj = { 
         "url": url,
         "title": title,
         "option": myOption,
         "votescore": 1
         };

        qVoteObj = { 
         "url": url,
         "title": title,
         "option": myOption
         };


        addVote(qScoreObj, qVoterObj, db, res, function(result) {
            if(result === 0){
            var sites = db.collection('userPolls');
                sites.findOne({
                "url": qVoteObj.url
                }, function(err, result) {
                console.log(result);
                if (err) throw err;
                if (result) {
                console.log(result);
                
                console.log('Open page from short URL: ' + result.url);
                //res.redirect(result);
                
                
                checkvoteData(qVoteObj, db ,res, function(result) {
                     //res.send(result);
                     console.log("vote!");
                     console.log("res: " + result);
                     
                      res.render('pages/chartView', {
                        "poll": "",
                        "test": result,
                        user: user,
                        "error": "Thanks For Your Vote! It All Counts!",
                        tagline: tagline
                        });
                 });
                
                } else {
                res.render('pages/pollView', {
                "origurl": "", 
                "test": "",   
                user: user,
                "error": "Wrong URL website address, please check again!",
                tagline: tagline
                });
                }
                });
    
                }
            else{
                
                var votesdata = checkvoteData(qVoteObj, db ,res, function(result) {
                      //res.send(result);
                      console.log("vote1!");
                      res.render('pages/chartView', {
                        "poll": "",
                        "test": result,  
                        user: user,
                        "error": "Sorry you Voted Already!",
                        tagline: tagline
                        });
                 });
                
                console.log("DATA : " + votesdata);
                
                 var sites = db.collection('userPolls');
                sites.findOne({
                "url": qVoteObj.url
                }, function(err, result) {
                console.log(result);
                if (err) throw err;
                if (result) {
                console.log(result);
                
                console.log('Open page from short URL: ' + result.url);
                
                console.log("vote2!");
                
                //res.redirect(result);
                res.render('pages/chartView', {
                "poll": result, 
                "test": votesdata,    
                user: user1,
                "error": "",
                tagline: tagline
                });
                }
            });
            }
    });
        
    }
     console.log("Here3!");
});

////        
    app.get('/getAggView/:poll*', function(req, res){
   console.log ("user:");
   var user = req.session.user || 0;
    console.log(user);
    
    var poll = req.params.poll;
 console.log("poll: " + poll);
 aggregateResults(poll, res, req ,db, function(result) {
           
                console.log(result);
                 //res.send(result);
                 // get title and add on to results array....
                 
                  var pollTitle = db.collection('userPolls');
                    pollTitle.findOne({
                      "url": poll
                    }, function(err, result1) {
                        console.log(result1);
                      if (err) throw err;
                      if (result1) {
                        console.log("Title" + result1);
        
        res.render('pages/getAggView', {
                poll: result,
                title: result1.title,
                user: user,
                 error: "",
                tagline: "polls"
            });
      } else {
            res.render('pages/getAggView', {
                poll: result,
                title: "none",
                user: user,
                error: "not found.",
                tagline: "polls"
            });
      }
    });
    
                 
                
            
    });
});
/////

app.get('/pollView/:poll*', function(req, res) {
       console.log ("user:");
   var user = req.session.user || 0;
    console.log(user);
    
   //console.log(req.body.urlnew);
   console.log("URL: " + req.params.poll);   
   
   //req.params.urlnew;
   var tagline = "URL info: ";
   
   var poll = req.params.poll;
   
        var fullUrl = req.protocol + '://' + req.get('host') + "/pollView/"+ poll;

        console.log(fullUrl);
        var newUrl = fullUrl + poll;
        console.log("NEW " + newUrl);
        
           
   var sites = db.collection('userPolls');
    sites.findOne({
      "url": poll
    }, function(err, result) {
        console.log(result);
      if (err) throw err;
      if (result) {
        console.log(result);
        
        console.log('Open page from short URL: ' + result.url);
        //res.redirect(result);
        res.render('pages/pollView', {
        "poll": result, 
        "twurl": fullUrl,            
        "error": "",
        user: user,
        tagline: tagline
    });
      } else {
     res.render('pages/pollView', {
        "origurl": "", 
        "twurl": "",            
            "error": "Wrong URL website address, please check again!",
        tagline: tagline
    });
      }
    });
   
});


///////

// polls page
    app.get('/polls', function(req, res) {
       // res.render('pages/polls.ejs'); // load the index.ejs file
       var user = req.session.user || 0;
       console.log("user: "+ user);
       
         getPolls(res,db, function(result) {
                console.log(result);
                res.render('pages/polls', {
                poll: result,
                 error: "",
                 user: user,
                tagline: "polls"
            });
    });
    });    

    // login form page
    app.get('/login', function(req, res) {

        // render then pass in any data if it exists
        res.render('pages/login.ejs', { message: 'loginMessage' }); 
    });

    // signup form page
    app.get('/signup', function(req, res) {
        var error ="";
        // render then pass in any flash data if it exists
        res.render('pages/signup.ejs', { error: ''});
    });


    // make sure logged in 
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('pages/profile.ejs', {
            user : req.session.user // get user session
        });
    });

    // logout user
    app.get('/logout', function(req, res) {
        req.session.user = null;
        res.redirect('/');
    });
////

// polls delete process
    app.get('/deleteMyPolls/:url*', isLoggedIn, function(req, res) {
        var user1 = req.session.user
        if (user1) {
    // user logged in
  console.log(user1);
	var url = req.param("url") || req.params.url;
    console.log("url: ", url);	

     db.collection('voteScore', function(err, collection) {
         if (err) throw err;
	// find the votescores with the list id to be delete and remove all associated.
      collection.remove({url: url}, {w:1}, function (err, result) {
        if (err) throw err;
        
		console.log("URL: ",url);
        console.log("Result from removing a vote Score(s): ", result);
		////
		db.collection('votes', function(err, collection) {
		    if (err) throw err;
			// all votes removed if they exits now remove the empty poll from logged in user.
      collection.remove({url: url}, {w:1}, function (err, result) {
        if (err) throw err;

        console.log("Result from removing a vote(s): ", result);
        console.log("delete list.");
        ///
        	db.collection('userPolls', function(err, collection) {
		    if (err) throw err;
			// all votes removed if they exits now remove the empty poll from logged in user.
              collection.remove({url: url}, {w:1}, function (err, result) {
                if (err) throw err;
        
                console.log("Result from removing a poll: ", result);
                console.log("delete poll.");
                });
               });
        ///
        });
       });
       res.redirect('/profile');
      });
    });	  	
    
  }
 else {
    // user is not logged in
	req.session.loginMsg = "Sorry. Please Log in.";
	 res.redirect('/');
 }  
        
        
        
  });

////

// polls process
    app.post('/viewAllMyPolls', isLoggedIn, function(req, res) {
        var user1 = req.session.user;
        var user =  req.session.user;
        console.log("user: "+ user);
        
        
        
        console.log("user1 is" + user1);
        var poll = req.query.poll;
        console.log("poll: " + poll);
            
        //var fullUrl = req.protocol + '://' + req.get('host') + "/pollView/"+poll;             
                
        getYourPolls(user1,res,db, function(result) {
            if(result.length > 0){  
                 res.render('pages/viewMyPolls', {
                                poll: result,
                                error: "",
                                user: user,
                                tagline: "polls"
                 });
           
           console.log("result: ");
           console.log(result);
            }
            else if(!result.length){
                console.log("result: ");
                console.log(result);
                 res.render('pages/viewMyPolls', {
                            poll: result,
                            error: "None Available.",
                            user: user,
                            tagline: "polls"
                            });
            }         
            else{
             res.render('pages/viewMyPolls', {
                poll: "",
                error: "error",
                user: user,                
                tagline: "polls"
            });
            }

    });
  }); 
  
  ////

  ////
  // polls process
  app.get('/myPollView/:poll*', isLoggedIn, function(req, res) {
   //console.log(req.body.urlnew);
   console.log("URL: " + req.params.poll);   
   
   //req.params.urlnew;
   var tagline = "URL info: ";
   
   var poll = req.params.poll;
   
        var fullUrl = req.protocol + '://' + req.get('host') + "/pollView/"+ poll;

        console.log(fullUrl);
        var newUrl = fullUrl + poll;
        console.log("NEW " + newUrl);
        
           
   var sites = db.collection('userPolls');
    sites.findOne({
      "url": poll
    }, function(err, result) {
        console.log(result);
      if (err) throw err;
      if (result) {
        console.log(result);
        
        console.log('Open page from short URL: ' + result.url);
        //res.redirect(result);
        res.render('pages/myPollView', {
        "poll": result, 
        "twurl": fullUrl,            
        "error": "Good URL",
        tagline: tagline
    });
      } else {
     res.render('pages/myPollView', {
        "origurl": "", 
        "twurl": "",            
        "error": "Wrong URL website address, please check again!",
        tagline: tagline
    });
      }
    });
  }); 
  
////
// add poll process
    app.post('/addPoll', isLoggedIn, function(req, res) {
      res.render('pages/addPoll', {
                poll: "",
                 error: "OK",
                tagline: "polls"
            });
    });
    
 ////
    app.post("/addNewPoll", isLoggedIn, function (req, res) {
    var user1 = req.session.user;
    console.log(req.body.ptitle);
    console.log(req.body.mytext.length);
    var title = req.body.ptitle;    
    var mytext = req.body.mytext;
    console.log(mytext[0]);
    
    var tagline = "Added Your Poll: ";
    
    
    var qPollObj = {};
        
    if (title !="" && mytext.length >0){
            
     var url = shortid.generate();

       console.log(url);
       
     var time = Math.floor(Date.now() / 1000);
       qPollObj = { 
         "when": time,
         "url": url,
         "user1": user1,
         "title": title,
         "options": mytext
       }; 
       
var pollquery = db.collection('userPolls'); 
        console.log(user1);
          console.log(qPollObj);
        pollquery.insert(qPollObj, function(err, resultPoll) {
         if (err) throw err; 
            console.log('Saved ');
            console.log (resultPoll); 
            console.log("poll data: ");
            console.log(qPollObj);
            
        res.render('pages/addedPoll', {
            tagline: tagline,
            error: "Added Ok"
          });
        });         
         }
        else{
                res.render('pages/addPoll', {
                    tagline: tagline,
                    error: "error"
                  });
            }       
    
    
              
            
   // res.send(qUserObj); 
});

////    
    
    // login process
    app.post('/login', function(req, res) {
    console.log(req.body.email);
    console.log(req.body.password);        
    var q1 = req.body.email;
    var q2 = req.body.password;
    var tagline = "Log In: ";
    
   var qUserObj = {};
   
   var valEmail = validator.validate(q1);
    console.log(valEmail);
    if (q1 !="" && q2 !="" && valEmail === true){
  var pwCheck = bcrypt.hashSync(q2, salt);
  
   qUserObj = { 
         "email": q1, 
         "password": q2
       }; 
       
    loginUser(qUserObj, db ,res,req, function(result) {
    
    console.log("IS: " + result);
     if(result === 0){
           res.render('pages/login', {
               user: qUserObj.email,
                 error: "Sign Up",
                tagline: tagline
            });
            
      }
     if(result === 1){
         req.session.user = qUserObj.email;
       res.render('pages/profile', {
               user: qUserObj.email,
                 error: "Sign Up",
                tagline: tagline
            });    
      }      
      else{
        // render  it exists
       // req.session.user = qUserObj.email;
           res.render('pages/signup', {
               user: qUserObj.email,
                 error: "Sign Up",
                tagline: tagline
            });
      }
    });
    }
    
    else { 
       qUserObj = { 
         "error": "Term not correct, please check again!" 
       }; 
       //res.send(urlObj); 
        res.render('pages/index', {
        "term": q1, 
        "when": "",            
        "error": "Term not correct, please check again!",
        tagline: tagline
    });
     }
      
    });
    
app.post("/signup", function (req, res) {
    console.log(req.body.uname);
    console.log(req.body.email);
    console.log(req.body.password);        
    var q0 = req.body.uname;    
    var q1 = req.body.email;
    var q2 = req.body.password;
    
    var tagline = "User Sign Up: ";
    
    
    var qUserObj = {};
        
    var valEmail = validator.validate(q1);
    console.log(valEmail);
    if (q0 !="" && q1 !="" && q2 !="" && valEmail === true){
  var pwCheck = bcrypt.hashSync(q2, salt);


console.log("ok" + pwCheck);
     
       qUserObj = { 
         "uname": q0,
         "email": q1, 
         "password": pwCheck
       }; 
       
    checkUser(qUserObj, db ,res,req, function(result) {
         console.log(result);
         console.log(result.ops);
         if(result === 0)
     {
              // saveUser(qUserObj, db,res);
               req.session.user = qUserObj.email;
               res.render('pages/profile', {
                user: qUserObj.email,
                 error: "OK",
                tagline: tagline
            });
     }
     if(result === 1)
     {
     //saveUser(qUserObj, db,res);
              // req.session.user = qUserObj.email;
               res.render('pages/login', {
                user: qUserObj.email,
                 error: "Enter Email and Password",
                tagline: tagline
            });
     }
       if(result === 2)
     {
     //saveUser(qUserObj, db,res);
              // req.session.user = qUserObj.email;
               res.render('pages/signup', {
                user: qUserObj.email,
                 error: "Wrong details.",
                tagline: tagline
            });
     }
     });
       
         
       //res.send(check); 
     
     } else { 
       qUserObj = { 
         "error": "Term not correct, please check again!" 
       }; 
       //res.send(urlObj); 
        res.render('pages/index', {
        "term": q1, 
        "when": "",            
        "error": "Term not correct, please check again!",
        tagline: tagline
    });
     } 
});

app.listen(port,  function () 
{
	
console.log('Node.js ... HERE ... listening on port ' + port + '...');

});


//////

function addVote(qScoreObj, user1, res ,db, callback) {
  getVoteData(qScoreObj, user1,res,db, function(data) {
    callback(data);
  });
}
   
function getVoteData(qScoreObj, user1, db, res, callback) { 
      // save into db collection
      
    //var squery= db.collection('pollsappdb');
    db.collection('votes', function(err, collection) {
           if (err) throw err; 
    collection.findOne({ user1: user1.user1, url : user1.url }, function(err, user) { 
        console.log("USER IS: " + user1.user1 + " " + user1);
    if (err) throw err; 
    if (user) { 
        console.log("user vote exists");
        console.log(user + " " + user1);
        callback(1);
      //  console.log(squery);
      //callback(user);
     // return user;
      //  res.send(user);
    } else {
            //console.log("users vote doesn't exist");
            var voteQuery = db.collection('votes'); 
            console.log(user1);
            
            voteQuery.insert(user1, function(err, result1) {
             if (err) throw err; 
                console.log('Saved ' + result1); 
                    
                    
                    
//////

                db.collection('voteScore', function(err, collection) {
                if (err) throw err; 
                collection.findOne({ option: qScoreObj.option }, function(err, voter) { 
                console.log("Choice IS: " + qScoreObj.option);
                if (err) throw err; 
                    if (voter !=null) { 
                    console.log("vote exists");
                    console.log(voter + " " + qScoreObj.option);
                    
                    
                    db.collection('voteScore').update(
                        
                        { url: qScoreObj.url, option : qScoreObj.option },
                           { $inc: { votescore: 1 } },
                           { upsert: true },
                    function(err, results) {
                    if (err) throw err; 
                    console.log("OK updated..."  + results);
                    });
                callback(0);
                }
                else
                {
                //////
                    var squery = db.collection('voteScore'); 
                    console.log(' score' + qScoreObj.votescore); 
                    squery.save(qScoreObj, function(err, result) {
                    if (err) throw err; 
                    console.log('Saved voter score' + result); 
                    // return result;
                    callback(0);
                    });
        
                }
                }); 
                });        
//return result;
                callback(0);
                //return 0;
                    });  
        
                    
    }// end else
    }); 
    }); 
   } 
//////

function updateVoteOptions(qPollObj, res,db, callback) {
  setUpdateVoteOptions(qPollObj,res,db, function(data) {
    callback(data);
  });
}

function setUpdateVoteOptions(qPollObj, res,db, callback) { 
    console.log("poll list user is : " + qPollObj);
    
       db.collection('userPolls', function(err, collection) {
     if (err) throw err; 
       collection.update({url:qPollObj.url}, {$addToSet: { options: qPollObj.option } }, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
               // res.send(collection);
                callback(collection);
            }
        });
    });
   }    

//////

function getYourPolls(user1, res,db, callback) {
  getYourPollsData(user1,res,db, function(data) {
    callback(data);
  });
}

function getYourPollsData(user1, res,db, callback) { 
    console.log("poll list user is : " + user1);

        var cursor = db.collection('userPolls').find( { "user1": user1 } ).sort({ when: -1 });
        cursor.skip(0);
        
        var tagline = "Your Polls: ";
        var result = [];
         var resultWhen = [];

          cursor.each(function(err, item) {
             if(item == null) {
                //db.close();
                  callback(result);
                return;
            }
        console.log(err);
          console.log(item);
// url , user1, title, option
console.log("options: " + item.options);
              result.push({id: item["_id"], url: item["url"], user: item["user1"], title: item["title"],options: item["options"],votescore: item["votescore"] });
              console.log(JSON.stringify(result));
    });
    
   }   

//////

function getPolls(res,db, callback) {
  getPollsData(res,db, function(data) {
    callback(data);
  });
}

function getPollsData(res,db, callback) { 
        var cursor = db.collection('userPolls').find().sort({ when: -1 });
        cursor.skip(0);
        
        var tagline = "Current Polls: ";
         var result = [];
         var resultWhen = [];

          cursor.each(function(err, item) {
             if(item == null) {
                //db.close();
                  callback(result);
                return;
            }
        console.log(err);
          console.log(item);

             result.push({url: item["url"], title: item["title"],options: item["options"] , when: item["when"] });
             console.log(JSON.stringify(result));
    });
   }    

//////

function loginUser(user1, res, req ,db, callback) {
  getLogData(user1, res,db, function(data) {
    callback(data);
  });
}


function getLogData(user1, db, res, callback) {
    //var squery= db.collection('pollsappdb');
    db.collection('pollsappdb', function(err, collection) {
           if (err) throw err; 
    //collection.findOne({ email: user1.email, password: user1.password }, function(err, user) { 
    collection.findOne({ email: user1.email }, function(err, user) { 

    if (err) throw err; 
    if ( user ) { 
        console.log("user exists");
        console.log(user1);
      //  console.log(squery);
      console.log("" + user1.email + ":  " + user1.password);
       var userdbpw =  user.password;
       if(userdbpw !=null){
         var checkpw = bcrypt.compareSync(user1.password, userdbpw); // true
            console.log("db pw: " + user.password);
       
        console.log("res " + checkpw);
          if(checkpw){
                   callback(1);
               }
               else
               {
                   callback(0);
               }
       }// db pw ok end
       else{
        checkpw = 0; 
        callback(0);
       }

      
      //  res.send(user);
    } else {
         console.log("No user exists");
        callback(0);
    }
    });
    }); 
   }

function checkUser(user1, res, req ,db, callback) {
  getData(user1, res,db, function(data) {
    callback(data);
  });
}
   
function getData(user1, db, res, callback) { 
      // save into db collection
      
    //var squery= db.collection('pollsappdb');
    db.collection('pollsappdb', function(err, collection) {
           if (err) throw err; 
    collection.findOne({ email: user1.email }, function(err, user) { 
        console.log("" + user1.email + " " + user1);
    if (err) throw err; 
    if (user) { 
        console.log("user exists");
        console.log(user + " " + user1);
         collection.findOne({ password: user1.password }, function(err, user) {
             if (err) throw err; 
        if (user) { 
            console.log("" + user1.email + " " + user1.password);
        callback(1);
        }
        else{
            callback(2);
        }
         });
      //  console.log(squery);
      //callback(user);
     // return user;
      //  res.send(user);
    } else {
        
        //console.log("user doesn't exist");
        //var result = saveUser(user1, db,res);
        
        var squery = db.collection('pollsappdb'); 
        console.log(user1);
        squery.insert(user1, function(err, result1) { 
         if (err) throw err; 
            console.log('Saved ' + result1); 
            //return result;
        callback(0);
        //return 0;
            });
    }
    }); 
    }); 
   } 
//////

function saveUser(userquery, db,res) { 
      // save search term and date into db collection
      
     var squery = db.collection('pollsappdb'); 
     squery.save(userquery, function(err, result) { 
       if (err) throw err; 
       console.log('Saved ' + result); 
        return result;
     }); 
   } 
   
// make sure user is logged in
function isLoggedIn (req, res, next) {
  if (!(req.session && req.session.user)) {
    return res.send('Not logged in!');
  }
  next();
}

//////
function checkvoteData(qScoreObj, db,res, callback) {
  getChartData(qScoreObj, db,res, function(data) {
    callback(data);
  });
}

function getChartData(qScoreObj, db,res, callback){
  db.collection("voteScore").find({url: qScoreObj.url}).toArray(function(err, docs){
    if ( err ) throw err;
    var optionsArray = [];
    var voteScores = [];
    var title = qScoreObj.title;
    var index;
   // var dieselPrices = [];

    for ( index in docs){
      var doc = docs[index];
      console.log (doc);
      //category array
      var option = doc['option'];
      console.log(option);
      //series 1 values array
      var score = doc['votescore'];
      console.log(score);
      //series 2 values array
      optionsArray.push(option);
      voteScores.push(score);
    }
    
    var dataset = [
      {
       data: voteScores
      }
    ];
    
    var response = [];
    response.push(title);
    response.push(optionsArray);
    response.push(voteScores);
    
     console.log("res: " + response);
    //res.json(response);
   callback((response));
   //callback(response);
  });
}


//////
function aggregateResults(url, res, req ,db, callback) {
  getARData(url, res,req ,db, function(data) {
    callback(data);
  });
}
   /// 
function getARData(url, res, req ,db, callback) { 
      // save into db collection
   db.collection('voteScore').aggregate(
     [
       { $match: { "url": url } },
       { $group: { "_id": "$votescore" , "count": { $sum: 1 } } }
     ]).toArray(function(err, result) {
       if ( err ) throw err;
       console.log(result);
       
       
       
       
       callback(result);
     });
    
   } 
  // end  
});