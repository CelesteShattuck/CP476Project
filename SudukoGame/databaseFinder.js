import { MongoClient } from 'mongodb';
var url = "mongodb://localhost:27017/";

function database(query)
{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("project");
        var query = { address: "Park Lane 38" };
        dbo.collection("games").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result); //should log our database
          db.close();
        });
      });
}