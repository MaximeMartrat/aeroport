const mysql = require('mysql2');
const express = require('express');
const { request } = require('express');

//constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

let conHandler = mysql.createConnection(
    {
        host:"172.17.0.2",
        user:"maximem",
        password:"maxm2023",
        database: "BeWebAirlines"
    }
);

conHandler.connect(function (err){
    if(err) throw err ;
    console.log("DB BewebAirlines connected !")
})

app.get('/', (req, res) => {
    // get all records from vol
    let myquery = "SELECT vol.id_vol, dep.ville AS villeDep, arr.ville AS villeArr, DATE_FORMAT(vol.horaire, '%d/%m/%Y %hh%m') AS horaire, vol.nbre_pass, avion.type, pilote.nom, pilote.id_pilote, avion.id_avion, vol.id_depart, vol.id_arrive FROM vol " ;
    myquery += "INNER JOIN aeroport AS dep ON vol.id_depart=dep.id_aeroport " ;
    myquery += "INNER JOIN aeroport AS arr ON vol.id_arrive=arr.id_aeroport " ;
    myquery += "INNER JOIN avion ON vol.id_avion=avion.id_avion " ;  
    myquery += "INNER JOIN pilote ON vol.id_pilote=pilote.id_pilote" 
    conHandler.connect(function (err) {
        if (err) throw err;
        conHandler.query(myquery, function (err, results, fields) {
            if (err) throw err;
            console.log(results);
            res.render("airlines", { 'title': "les vols de la compagnie", 'display_results': results });
        });//end funct
    });//end connect
});//en app.get

//route qui sert les requetes fetch du client
app.get('/pilote/:id', function(req,res){
    console.log(req.params.id);
    //je me connecte à la BDD
    conHandler.connect(function (err) {
        if(err) throw err;
        //je récupère l'enregistrement (il ne peut y en avoir qu'un)
        let myquery = "SELECT * FROM pilote WHERE `id_pilote`="+ req.params.id ;
        //j'execute la requête
        conHandler.query(myquery, function (err, results, fields) {
            if(err) throw err;
            //je vérifie sur la console que j'ai bien quelque chose
            console.log(results);
            //je retourne les résultats
            res.send(results) ;
        });
    })
})

//route qui sert les requetes fetch du client
app.get('/avion/:id', function(req,res){
    console.log(req.params.id);
    //je me connecte à la BDD
    conHandler.connect(function (err) {
        if(err) throw err;
        //je récupère l'enregistrement (il ne peut y en avoir qu'un)
        let myquery = "SELECT *,DATE_FORMAT(avion.date_achat, '%d/%m/%Y') AS date_achat, DATE_FORMAT(avion.date_revision, '%d/%m/%Y') AS date_revision FROM avion WHERE `id_avion`="+ req.params.id ;
        //j'execute la requête
        conHandler.query(myquery, function (err, results, fields) {
            if(err) throw err;
            //je vérifie sur la console que j'ai bien quelque chose
            console.log(results);
            //je retourne les résultats
            res.send(results) ;
        });
    })
})

//route qui sert les requetes fetch du client
app.get('/aeroport/:id', function(req,res){
    console.log(req.params.id);
    //je me connecte à la BDD
    conHandler.connect(function (err) {
        if(err) throw err;
        //je récupère l'enregistrement (il ne peut y en avoir qu'un)
        let myquery = "SELECT * FROM aeroport WHERE `id_aeroport`=" + req.params.id ;
        //j'execute la requête
        conHandler.query(myquery, function (err, results, fields) {
            if(err) throw err;
            //je vérifie sur la console que j'ai bien quelque chose
            console.log(results);
            //je retourne les résultats
            res.send(results) ;
        });
    })
})

app.listen(PORT, HOST);
console.log(`running on http://${HOST}:${PORT}`);
        