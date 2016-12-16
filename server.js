var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var mongoose = require("mongoose");
var config = require('./config');
var app = express();
app.use(express.static('public'));

var Item = require('./models/item');



var Storage = {
  add: function(name) {
    var item = {name: name, id: this.setId};
    this.items.push(item);
    this.setId += 1;
    return item;
  } 
};

var createStorage = function() {
  var storage = Object.create(Storage);
  storage.items = [];
  storage.setId = 1;
  return storage;
}

var storage = createStorage();

storage.add('Broad beans');
storage.add('Tomatoes');
storage.add('Peppers');



app.get('/items', function(request, response) {
    //response.json(storage.items);
     Item.find(function(err, items) {
        if (err) {
            return response.status(500).json({
                message: 'Internal Server Error'
            });
        }
        response.json(items);
    });
});

app.post('/items', jsonParser, function(request, response) {
   /* if (!('name' in request.body)) {
        return response.sendStatus(400);
    }

    var item = storage.add(request.body.name);
    response.status(201).json(item);*/
    
     Item.create({
        name: request.body.name
    }, function(err, item) {
        if (err) {
            return response.status(500).json({
                message: 'Internal Server Error'
            });
        }
        response.status(201).json(item);
    });
    
});

app.delete('/items/:id', function(request, response){
  /*if(!request.params.id){
    return response.sendStatus(400);
  }
  
  
  for(var i = 0; i < storage.items.length; i++){
    console.log(storage.items[i].id);
    if(storage.items[i].id == request.params.id){
      storage.items.splice(i, 1);
    }
  }
  response.status(201).json(storage.items);*/
  
   var _id = mongoose.Types.ObjectId(request.params.id);
    Item.remove({
        _id: _id
    }, function(err, item) {
        if (err || !item) {
            console.error("Could not delete item", request.body.name);
            mongoose.disconnect();
            return;
        }
        console.log("Deleted item", item.result);
        response.status(201).json(item);
    });
  
});

app.put('/items/:id', jsonParser, function(request, response){
 /* if(!request.params.id){
    return response.sendStatus(400);
  }
  
  if(!('name' in request.body)){
    return response.sendStatus(400);
  }
  
  console.log(request.params.id);
  
  for(var i = 0; i < storage.items.length; i++){
    if(storage.items[i].id == request.params.id){
      storage.items[i].name = request.body.name;
    }
  }
  response.status(201).json(storage.items);*/
  
  
    var _id = mongoose.Types.ObjectId(request.params.id);
    Item.findOneAndUpdate({
        _id: _id
    }, {
        $set: {
            name: request.body.name
        }
    }, {
        new: true
    }, function(err, item) {
        if (err || !item) {
            console.error("Could not update item", request.body.name);
            mongoose.disconnect();
            if (err) {
                return response.status(500).json({
                    message: 'Internal Server Error'
                })
            }
        }
        console.log("Updated item", item.name);
        response.status(201).json(item);
    });
  
});

//app.listen(process.env.PORT || 8080, process.env.IP);

app.use('*', function(req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;