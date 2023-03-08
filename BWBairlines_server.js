const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');


//constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
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
});

app.get('/create', function(req,res){
    res.render("create", { 'title': "ajouter un élément" })
})

app.post('/create', function(req,res){
    //faire la requete qui permet de créer l'élément
    console.log(req.body.table);
    let values = req.body ;
    let tabname = req.body.table ;

    if(tabname == 'avion') {
        conHandler.connect(function(err) {
            if(err) throw err ;
            let constructeur = req.body.constructeur ;
            let type = req.body.type ;
            let rayon_action = req.body.rayon_action ;
            let capacite = req.body.capacite ;
            let date_achat = req.body.date_achat ;
            let date_revision = req.body.date_revision ;
            let myquery = "INSERT INTO " + tabname + " (constructeur, type, rayon_action, capacite, date_achat, date_revision) " ;
            myquery += "VALUES ('"+  
            constructeur + "' , '" +
            type + "' , '" +
            rayon_action + "' , '" +
            capacite + "' , " +
            "DATE_FORMAT('" + date_achat +"', '%Y/%m/%d')" + " , " +
            "DATE_FORMAT('" + date_revision +"', '%Y/%m/%d')" +  " ) " ;
            console.log(myquery) ;
            //j'execute la requete
            conHandler.query(myquery, function(err, results, fields) {
                if(err) throw err;
                console.log(results);
                res.render("confirm", { 'element': "l'avion a bien été créé" })
            })
        })
    }
    if(tabname == 'aeroport') {
        conHandler.connect(function(err) {
            if(err) throw err ;
            let ville = req.body.ville ;
            let nbre_pistes = req.body.nbre_pistes ;
            let URL_image = req.body.URL_image ;
            let myquery = "INSERT INTO " + tabname + " (ville, nbre_pistes, URL_image) " ;
            myquery += "VALUES ('"+  
            ville + "' , " +
            nbre_pistes + " , '" +
            URL_image   +  "'  ) " ;
            console.log(myquery) ;
            //j'execute la requete
            conHandler.query(myquery, function(err, results, fields) {
                if(err) throw err;
                console.log(results);
                res.render("confirm", { 'element': "l'aeroport a bien été créé" })
            })
        })
    }
});

app.get('/mod_avion', function(req,res){
    res.render("mod_avion", { 'title' : "action sur entité avion" })
})

/*
deux options :
-soit faire des routes par action : Create/Update/Delete
-soit faire des routes par entité : C/U/D par table
*/

app.listen(PORT, HOST);
console.log(`running on http://${HOST}:${PORT}`);
        