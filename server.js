// USEFUL RESOURCE: https://stackoverflow.com/questions/28357965/mongoose-auto-increment

// NOTE** : The app is not correctly auto-incrementing the short_url, ,it does it even when the url is invalid, need a fix

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const isUrl = require('is-url');
const  AutoIncrement = require('mongoose-sequence')(mongoose);

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI);

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));


const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});


urlSchema.plugin(AutoIncrement, { id:"short", inc_field: "short_url", disable_hooks: true });

/* The generator does not work when the app restarts

// Using a generator function to get a new short url for every new request 
function* newNumber () {
  let foo = 0;
  while (true) {
    yield foo++;
  }
}
let it = newNumber();  //starting the generator

*/


const Url = mongoose.model('Url', urlSchema);

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});



app.post('/api/shorturl/new', async (req, res) => {
  try {
    let { url } = req.body;
    let newUrl = url.replace(/https?:\/\//, '');

    // checking if the url is syntactically valid
    if(!isUrl) {
      return res.json({ "error": "Invalid URL"});
    }


    // checking if the website at the given url exists
    dns.lookup(newUrl, (err, add, family) => {
      if (err) { return res.json({ "error": "Invalid URL"}) }
    });


    let foundUrl = await Url.findOne({ original_url: newUrl });

    if (foundUrl) {
      let { original_url, short_url } = foundUrl
      return res.json({original_url, short_url});  
    
    } else {
      
      try {
        let created = await Url.create({ original_url: newUrl })
        let updated = await created.setNext('short')   // manually updating the short field using mongoose-sequence
         res.json({
                original_url: updated.original_url, 
                short_url: updated.short_url
              });

      } catch(error) {
        res.send(error);
      }
      
    }
    
  } catch (err) {
    res.send(err);
  }
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
