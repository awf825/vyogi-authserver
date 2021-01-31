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

   For big file seeding (mongo shell):
   ```
   var file = cat('./schemas/lessons/Sat\ Jan\ 30\ 2021\ 15:00:44\ GMT-0500\ \(Eastern\ Standard\ Time\).json');

   var o = JSON.parse(file);

   db.lessons.insert(o);

   db.lessons.save()
   ```

   Something like this will update a nested array that already has at least one entry. $push is a very cool command, because you can also attach nested attrs to a document on the fly i.e a custom attr.  
   ```
   User.update({"email": "client1@clientmail.com"}, {$push: {bookings: {bookingId: "bkg", lessonId: "lsn"}}});

   User.update({"email": "client1@clientmail.com"}, {$push: {friends: {bookingId: "bkg", lessonId: "lsn"}}});
   ```

   Something like this will update a nested array that doesn't have an entries
   ```
   User.update({"email": "client1@clientmail.com"}, {$addToSet: {bookings: {bookingId: "bkg", lessonId: "lsn"}}});
   ``` 