// USEFUL RESOURCE: https://stackoverflow.com/questions/28357965/mongoose-auto-increment

// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const isUrl = require('is-url');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/url-shortener');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));


const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});


// Using a generator function to get a new short url for every new request 
function* newNumber () {
  let foo = 0;
  while (true) {
    yield foo++;
  }
}
let it = newNumber();  //starting the generator

const Url = mongoose.model('Url', urlSchema);


app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl/new', async (req, res) => {
  let { url } = req.body;
  let newUrl = url.replace(/https?:\/\//, '');
  console.log(url);
  console.log(newUrl);

  // checking if the url is syntactically valid
  if(!isUrl) {
    return res.json({ "error": "Invalid URL"});
  }


  // checking if the website at the given url exists
  dns.lookup(newUrl, (err, add, family) => {
    if (err) { return res.json({ "error": "Invalid URL"}) }
  });


  Url.findOne({ original_url: newUrl }).then((doc) => {
    // if we find the doc, we return it from the db
    // ese we create a new doc in the db for the url
    console.log('found');
    console.log('doc :', doc);
    if (doc) {
      return res.json(doc);
    } else {
      const newOne = new Url({
        original_url: newUrl,
        short_url: it.next().value
      });
      newOne.save().then((doc) => {
        return res.json(doc);
      }, (e) => console.log(e));
    }

  }, (e) => {
    console.log('not found');
    return console.log('Error: cannot create');
  });
});


app.get('/api/short/:short', async (req, res) => {
  let short = req.params.short;
  Url.findOne({short_url: short}).then((doc) => {
    if (doc) {
      console.log('doc: ', doc);
      res.redirect(`https://${doc.original_url}`);
    } else {
      res.status(400).send('bad request');
    }
  }, (e) => { console.log(e)});
  
})

const PORT = process.env.port || 3000;

// listen for requests :)
const listener = app.listen(PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
