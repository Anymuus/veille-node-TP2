const express = require('express');
const fs = require('fs');
const util = require("util");
const http = require('http');

////////////////////////////// socket.io ////////////////////////
//const server = http.createServer(app);
//const io = require('./mes_modules/chat_socket').listen(server);
/////////////////////

const app = express();
const peupler = require('./mes_modules/peupler');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient; // le pilote MongoDB
const ObjectID = require('mongodb').ObjectID;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
/* on associe le moteur de vue au module «ejs» */
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(express.static('public'));
const i18n = require('i18n');
i18n.configure({ 
   locales : ['fr', 'en'],
   cookie : 'langueChoisie', 
   directory : __dirname + '/locales' })

app.use(i18n.init);


/* Ajoute l'objet i18n à l'objet global «res» */

app.get('/:locale(fr|en)',  (req, res) => {
  // on récupère le paramètre de l'url pour enregistrer la langue
 
  /*if(req.params.locale == 'undefined'){
     res.cookie('langueChoisie' , 'fr')
     res.setLocale(req.params.locale)
  }else{
     res.cookie('langueChoisie' , req.params.locale)
     res.setLocale(req.params.locale)
  }*/
  res.cookie('langueChoisie' , req.params.locale)
  res.setLocale(req.params.locale)
  // on peut maintenant traduire

  console.log('res.__(accueil) = ' + res.__('accueil'))
  res.render('accueil.ejs')
})


let db // variable qui contiendra le lien sur la BD

MongoClient.connect('mongodb://127.0.0.1:27017', (err, database) => {
 if (err) return console.log(err)
 db = database.db('carnet_adresse')
console.log('connexion à la BD')
// lancement du serveur Express sur le port 8081
 app.listen(8081, (err) => {
 	if (err) console.log(err)
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})


/*
Les routes
*/

////////////////////////////////////////// Route /
app.set('view engine', 'ejs'); // générateur de template


//////////////////////////////////////////
app.get('/', function (req, res) {

 res.render('accueil.ejs')  
 
  });



//////////////////////////////////////////  Route Adresse
app.get('/adresse', function (req, res) {
   var cursor = db.collection('adresse')
                .find().toArray(function(err, resultat){
 if (err) return console.log(err)        
 res.render('adresse.ejs', {adresses: resultat})   
  });
})
//////////////////////////////////////////  Route Rechercher
app.post('/rechercher',  (req, res) => {

})
////////////////////////////////////////// Route /ajouter
app.post('/ajouter', (req, res) => {
console.log('route /ajouter')	
 db.collection('adresse').save(req.body, (err, result) => {
 if (err) return console.log(err)
 // console.log(req.body)	
 console.log('sauvegarder dans la BD')
 res.redirect('/adresse')
 })
})

////////////////////////////////////////  Route /modifier
app.post('/modifier', (req, res) => {
console.log('route /modifier')
// console.log('util = ' + util.inspect(req.body));
req.body._id = 	ObjectID(req.body._id)
 db.collection('adresse').save(req.body, (err, result) => {
	 if (err) return console.log(err)
	 console.log('sauvegarder dans la BD')
	 res.redirect('/adresse')
	 })
})


////////////////////////////////////////  Route /detruire
app.get('/detruire/:id', (req, res) => {
 console.log('route /detruire')
 // console.log('util = ' + util.inspect(req.params));	
 var id = req.params.id
 console.log(id)
 db.collection('adresse')
 .findOneAndDelete({"_id": ObjectID(req.params.id)}, (err, resultat) => {

if (err) return console.log(err)
 res.redirect('/adresse')  // redirige vers la route qui affiche la collection
 })
})


///////////////////////////////////////////////////////////   Route /trier
app.get('/trier/:cle/:ordre', (req, res) => {

 let cle = req.params.cle
 let ordre = (req.params.ordre == 'asc' ? 1 : -1)
 let cursor = db.collection('adresse').find().sort(cle,ordre).toArray(function(err, resultat){

  ordre = (req.params.ordre == 'asc' ? 'desc' : 'asc')  
 res.render('adresse.ejs', {adresses: resultat, cle, ordre })	
})

}) 


/////////////////////////////////////////////////////////  Route /vider
app.get('/vider', (req, res) => {

	let cursor = db.collection('adresse').drop((err, res)=>{
		if(err) console.error(err)
			console.log('ok')
			
		})
	res.redirect('/adresse')
})


////////////////////////////////////////////////////////  Route /peupler

app.get('/peupler', (req, res) => {
  db.collection('adresse').insertMany(peupler(), (err, result) => {
  if (err) return console.log(err)
    console.log('sauvegarder dans la BD')
    res.redirect('/adresse')
  })
})




////////////////////////////////////////////////////////// Route /ajax_modifier
app.post('/ajax_modifier', (req,res) => {
   req.body._id = ObjectID(req.body._id)

   db.collection('adresse').save(req.body, (err, result) => {
   if (err) return console.log(err)
       console.log('sauvegarder dans la BD')
   res.send(JSON.stringify(req.body));
   // res.status(204)
   })
})


////////////////////////////////////////////////////////// Route /ajax_ajouter

app.post('/ajax_ajouter', (req, res) => {
  db.collection('adresse').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('sauvegarder dans la BD')
    res.send(JSON.stringify(req.body))
  })
})


////////////////////////////////////////////////////////// Route /ajax_supprimer

app.post('/ajax_supprimer', (req, res) => {
  db.collection('adresse').findOneAndDelete({"_id": ObjectID(req.body._id)}, (err, resultat) => {
    if (err) return console.log(err)
    console.log('supprimé de la BD')
    res.send(JSON.stringify(req.body))
  })
})












