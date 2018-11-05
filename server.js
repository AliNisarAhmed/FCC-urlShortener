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
  address: { type: String, required: true, unique: true, index: true },
  short_url: { type: Number }
});

const Url = mongoose.model('Url', urlSchema);

// let entry = new Url({
//   address: 'www.freecodecamp.com',
//   short_url: 6
// });
// entry.save().then((url) => {
//   console.log('url saved: ', url);
// });

Url.fineOne({address: 'www.freecodecamp.com'}, (err, obj) => {
  if (err) {
    return console.log('failed to find the address, need to create');
  } else {
    console.log('found:
  }
})


// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl/new', (req, res) => {
  let { url } = req.body;
  let newUrl = url.replace(/https?:\/\//, '');
  console.log(url);
  console.log(newUrl);
  dns.lookup(newUrl, (err, add, family) => {
    if (err) { return res.json({ "error": "Invalid URL"}) }
  });
  let searchDb = Url.findOne({address: newUrl}, (err, object) => {
    if (err) {
      // let count = Url.estimatedDocumentCount() + 1;
      // console.log('count: ', count);
      // let entry = new Url({ address: newUrl, short_url: count })
      // entry.save().then(console.log, console.log);
      // return res.json({ address: newUrl, short: count });
    } else {
      console.log('object: ', object);
      res.redirect(`/api/short/${object.short_url}`);
    }
  })
})

app.get('/api/short/6', (req, res) => {
  res.redirect('//www.freecodecamp.com');        
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
