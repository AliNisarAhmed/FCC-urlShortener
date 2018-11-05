// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));


const Schema = mongoose.Schema;

const urlSchema = new Schema({
  address: { type: String, required: true },
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);



// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl/new', (req, res) => {
  let { url } = req.body;
  console.log(url);
  dns.lookup(url, { family: 6, all: true, verbatim: true}, (err, add, family) => {
    if (err) { return console.log(err); }
    console.log('add: ', add);
    console.log(typeof add);
    console.log("family ", family);
  })
  res.send('post request received');
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
