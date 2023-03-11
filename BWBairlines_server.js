const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const { request } = require('express');


//constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");

let pool = mysql.createConnection(
    {
        host:"172.17.0.2",
        user:"maximem",
        password:"maxm2023",
        database: "BeWebAirlines",
        multipleStatements: true
    }
);

pool.connect(function (err){
    if(err) throw err ;
    console.log("DB BewebAirlines connected !")
})

app.get("/", (req,res) =>{
    res.redirect('/login');
});

app.get("/login", (req,res) =>{
    res.render('login', {'title':'Login', 'message':'Merci de vous connecter'})
});


app.post("/check", (req, res) =>{
    // console.log(req.body);
    //variables du contenu du body
    let username = req.body.username;
    let password = req.body.password;
    //requete SQL
    let myquery = `SELECT username, password FROM user WHERE username = ? AND password = ? `;
    //connection à la database
    pool.connect((err) =>{
        if(err) throw err ;
        //execute la requete
        pool.query(myquery, [username, password], (err, results) =>{
            if(err) throw err ;
            // console.log(results);
            // si tableau n'est pas vide
            if(results.length == 1) {
                //user + password valide
                res.render('accueil', { 'title':'accueil', 'message': `Bienvenue ${username}`});
            }
            else if (results.length > 1){
                res.render('login',{ 'title':'login','message': `Problème, plusieurs utilisateurs dans la DB`})
            }
            //sinon l'utilisateur ou le password n'existe pas
            else {
                res.render('login', {'title':'login' ,'message': `Identifiant ou mot de passe incorrect`})
            }
        });
    });
});

app.get('/signIn', (req,res)=>{
    res.render('createUser');
})

app.post('/createUser', (req,res)=>{
    console.log(req.body)
    let username = req.body.username ;
    let email = req.body.email ;
    let password = req.body.password ;

    let myquery = "INSERT INTO user (username, email, password) VALUES (?,?,?)"
    pool.connect((err)=>{
        if(err) throw err
        pool.query(myquery, [ username,email,password], (err,results)=>{
            if(err) throw err
            res.render('login', {'title':'login' ,'message': `Vous vous êtes bien enregistré`})
        }) 
    })
})

app.get('/liste', (req, res) => {
    // Récupérer les enregistrements pour la page actuelle
    let myquery = "SELECT vol.id_vol, dep.ville AS villeDep, arr.ville AS villeArr, DATE_FORMAT(vol.horaire, '%d/%m/%Y %Hh%m') AS horaire, vol.nbre_pass, avion.type, pilote.nom, pilote.id_pilote, avion.id_avion, vol.id_depart, vol.id_arrive FROM vol " ;
    myquery += "INNER JOIN aeroport AS dep ON vol.id_depart=dep.id_aeroport " ;
    myquery += "INNER JOIN aeroport AS arr ON vol.id_arrive=arr.id_aeroport " ;
    myquery += "INNER JOIN avion ON vol.id_avion=avion.id_avion " ;  
    myquery += "INNER JOIN pilote ON vol.id_pilote=pilote.id_pilote " ;
    myquery += "LIMIT ? OFFSET ?";
    const limit = 10;
    let offset;
    if (req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    } else {
        offset = 0;
    }
    pool.connect(function (err) {
        if (err) throw err;
        // Envoyer la requête au serveur MySQL
        pool.query(myquery, [limit, offset], function (err, results, fields) {
            if (err) throw err;
            console.log(results);
            res.render("airlines", { 'title': "BeWeB airlines", 'display_results': results,  'offset': offset });
        });//end funct
    });//end connect
});//en app.get

app.get('/liste/:offset', (req, res)=>{
    const offset = parseInt(req.params.offset, 10);
})



//route qui sert les requetes fetch du client
app.get('/pilote/:id', function(req,res){
    console.log(req.params.id);
    //je me connecte à la BDD
    pool.connect(function (err) {
        if(err) throw err;
        //je récupère l'enregistrement (il ne peut y en avoir qu'un)
        let myquery = "SELECT * FROM pilote WHERE id_pilote = ?";
        const reqId = req.params.id;
        //j'execute la requête
        pool.query(myquery, [reqId],function (err, results, fields) {
            if(err) throw err;
            //je vérifie sur la console que j'ai bien quelque chose
            // console.log(results);
            //je retourne les résultats
            res.send(results) ;
        });
    })
})

//route qui sert les requetes fetch du client
app.get('/avion/:id', function(req,res){
    // console.log(req.params.id);
    //je me connecte à la BDD
    pool.connect(function (err) {
        if(err) throw err;
        //je récupère l'enregistrement (il ne peut y en avoir qu'un)
        let myquery = "SELECT *,DATE_FORMAT(avion.date_achat, '%d/%m/%Y') AS date_achat, DATE_FORMAT(avion.date_revision, '%d/%m/%Y') AS date_revision FROM avion WHERE `id_avion`="+ req.params.id ;
        //j'execute la requête
        pool.query(myquery, function (err, results, fields) {
            if(err) throw err;
            //je vérifie sur la console que j'ai bien quelque chose
            // console.log(results);
            //je retourne les résultats
            res.send(results) ;
        });
    })
})

//route qui sert les requetes fetch du client
app.get('/aeroport/:id', function(req,res){
    console.log(req.params.id);
    //je me connecte à la BDD
    pool.connect(function (err) {
        if(err) throw err;
        //je récupère l'enregistrement (il ne peut y en avoir qu'un)
        let myquery = "SELECT * FROM aeroport WHERE `id_aeroport`= ? ";
        const reqId = req.params.id ;
        //j'execute la requête
        pool.query(myquery, [reqId],function (err, results, fields) {
            if(err) throw err;
            //je vérifie sur la console que j'ai bien quelque chose
            // console.log(results);
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
        pool.connect(function(err) {
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
            pool.query(myquery, function(err, results, fields) {
                if(err) throw err;
                console.log(results);
                res.render("confirm", { 'element': "l'avion a bien été créé" })
            })
        })
    } else if(tabname == 'aeroport') {
        pool.connect(function(err) {
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
            pool.query(myquery, function(err, results, fields) {
                if(err) throw err;
                console.log(results);
                res.render("confirm", { 'element': "l'aeroport a bien été créé" })
            })
        })
    } else if(tabname == 'pilote') {
        pool.connect(function(err) {
            if(err) throw err ;
            let nom = req.body.nom ;
            let adresse = req.body.adresse ;
            let salaire = req.body.salaire ;
            let qualification = req.body.qualification ;
            let myquery = "INSERT INTO " + tabname + " (nom, adresse, salaire, qualification) " ;
            myquery += "VALUES ('"+  
            nom + "' , '" +
            adresse + "' , " +
            salaire + " , '" +
            qualification + "' ) " ;
            console.log(myquery) ;
            //j'execute la requete
            pool.query(myquery, function(err, results, fields) {
                if(err) throw err;
                console.log(results);
                res.render("confirm", { 'element': "le pilote a bien été ajouté" })
            })
        })
    } else if(tabname == 'vol'){
        pool.connect(function(err) {
            if(err) throw err ;
            let passager = req.body.nbre_pass ;
            let avion = req.body.select_avion ;
            let pilote = req.body.select_pilote;
            let depart = req.body.select_depart;
            let arrivee = req.body.select_arrivee ;
            let date = req.body.date ;
            let horaire = req.body.horaire ;
            let myquery = "INSERT INTO " + tabname + " (nbre_pass, id_avion, id_pilote, id_depart, id_arrive, horaire) " ;
            myquery += "VALUES ("+  
            passager + " , " + 
            avion + " , " +
            pilote + " , " +
            depart + " , " +
            arrivee + " , '" +
            date + " " + horaire  +  "'  ) " ;
            console.log(myquery) ;
            //j'execute la requete
            pool.query(myquery, function(err, results, fields) {
                if(err) throw err;
                console.log(results);
                res.render("confirm", { 'element': "le vol a bien été ajouté dans la liste des vols" })
            });
        });
    }
});
 app.get('/volSelect',function(req,res){
    let allResults = {};
    let avionTab = " SELECT * FROM avion";
    let aeroportTab = "SELECT * FROM aeroport";
    let piloteTab = "SELECT * FROM pilote";
    pool.query(avionTab, function(err, results, fields) {
        if (err) throw err;
        allResults.avion = results;
        pool.query(aeroportTab, function(err, results, fields) {
            if (err) throw err;
            allResults.aeroport = results;
            pool.query(piloteTab, function(err, results, fields) {
                if (err) throw err;
                allResults.pilote = results;
                res.send(allResults)
            });
        })
    });
});

app.get('/mod_avion', function(req,res){
    res.render("mod_avion", { 'title' : "Modification des avions" })
})

/*
deux options :
-soit faire des routes par action : Create/Update/Delete
-soit faire des routes par entité : C/U/D par table
*/

app.listen(PORT, HOST);
console.log(`running on http://${HOST}:${PORT}`);
        