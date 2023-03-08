const mysql = require('mysql2');
const express = require('express');

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
        database: "TechData"
    }
);

conHandler.connect(function (err){
    if(err) throw err ;
    console.log("DB TechData connected !")
})

//first query to console
// conHandler.connect(function (err){
//     if(err) throw err ;
//     conHandler.query("SELECT * FROM TechTable", function(err,results,fields){
//         if(err) throw err;
//         console.log(results)
//     })
// })

app.get('/', (req,res)=> {
    res.send('<h2>HELLO World from a DOCKER NODEJS !!</h2>')
})

app.get('/all', (req, res) => {
    conHandler.connect(function (err) {
        if(err) throw err;
        conHandler.query("SELECT ID, serverName, IPadr FROM TechTable ORDER BY Location LIMIT 0, 10", function (err, results, fields) {
            if(err) throw err;
                // console.log(results)
                res.render("results", {'title' : "liste complète", 'display_results': results });
        });
    })
})

app.get('/detail/:id', (req, res) => {
    conHandler.connect(function (err) {
        if(err) throw err;
        let myquery = "SELECT * FROM TechTable WHERE `ID`="+ req.params.id ;
        // console.log(myquery);
        conHandler.query(myquery, function (err, results, fields) {
            if(err) throw err;
            // console.log(results);
            res.render("details", {'title' : "liste détaillée", 'display_results': results });
        });
    })
})

app.listen(PORT, HOST);
console.log(`running on http://${HOST}:${PORT}`);