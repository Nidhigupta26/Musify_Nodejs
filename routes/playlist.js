var router = require('express').Router();
var mongoClient = require('mongodb').MongoClient;
var ObjectID = require("mongodb").ObjectID;
var db;

url = "mongodb+srv://Vaibhav:vaibhav9452@cluster0.cwaua.mongodb.net/test";

mongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
    if (err) throw err;
    db = client.db('musify');
    console.log("DB connected");
});




router.get("/", function (req, res) {
    if (req.session.loggedIn) {
        var id = req.session.user; 
        db.collection("users").findOne({ _id: ObjectID(id) }, function (err, result) {
            if (err) {
                return res.status(400).json({ error: 'An error occurred' });
            }
            res.render("playlist", {
                data: result.playlist,
                recent:result.recent,
                title: 'Playlist',
                style: 'index.css',
                script: "delete.js",
                user: req.session.user,
                username: req.session.username
            });
        });
    }
    else {
        res.redirect("/login");
    }

});



router.post('/add', function (req, res) {
    var audioSrc = req.body.audioSrc;
    var songName = req.body.songName;
    var image = req.body.image;
    var _id = new ObjectID();

    var playlistObj = { _id, audioSrc, songName, image };

    var id = req.session.user; // this should be come from req.session when user login
    db.collection("users").updateOne({ _id: ObjectID(id) }, { $push: { playlist: playlistObj } }, function (err, result) {
        if (err) {
            return res.status(400).json({ error: "An error occurred" });
        }
        res.json({
            success: "Successfully added"
        });
    });
});

router.delete("/:songId", function (req, res) {
    var { songId } = req.params;
    var id = req.session.user; 
    db.collection("users").updateOne({ _id: ObjectID(id) }, { $pull: { "playlist": { _id: ObjectID(songId) } } }, function (err, result) {
        
        if (err) throw err;
        res.json({
            success: 'Successfully deleted'
        });
    });
});


router.post('/recent/add', function (req, res) {
    var audioSrc = req.body.audioSrc;
    var songName = req.body.songName;
    var image = req.body.image;
    var _id = new ObjectID();
    var recent = { _id, audioSrc, songName, image };
    var id = req.session.user; 

    db.collection("users").updateOne({ _id: ObjectID(id) }, { $addToSet: { recent: recent} }, function (err, result) {
        if (err) {
            return res.status(400).json({ error: "An error occurred" });
        }
        res.json({
            success: "Successfully added"
        });
    });    
});


router.delete("/recent/:songId", function (req, res) {
    var { songId } = req.params;
    var id = req.session.user; 
    db.collection("users").updateOne({ _id: ObjectID(id) }, { $pull: { "recent": { _id: ObjectID(songId) } } }, function (err, result) {
        
        if (err) throw err;
        res.json({
         success: 'Successfully deleted'
             });
            });  
         });

         
router.get("/next", function (req, res) {
    if (req.session.loggedIn) {
        var id = req.session.user; 
        db.collection("users").findOne({ _id: ObjectID(id) }, function (err, result) {
            if (err) {
                return res.status(400).json({ error: 'An error occurred' });
            }
            res.send(result.playlist);
        });
    }
    else {
        res.redirect("/login");
    }
});



module.exports = router;