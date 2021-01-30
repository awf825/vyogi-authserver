### REMINDERS
   Fire up mongod like:
   ```
   mongod --dbpath=/path/to/mongopackage
   (stop forgetting where this is...)
   ```

   Good script:
   ```
   var getAllIds = db.getCollection('x').find({}, {_id:1}).map(function(item){ return item._id; })
   ```