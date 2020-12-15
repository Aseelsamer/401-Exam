'use strict';

require('dotenv').config();

let express = require('express');
let server = express();
let cors = require('cors');
let methodOverride = require('method-override');
let pg = require('pg');
let superagent = require('superagent');
let PORT = process.env.PORT || 3000;


server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);

server.get('/', homepage);
function homepage(req, res) {
    res.render('index');

}

server.get('/getCountryResult', covidDataHandlerFunc);
function covidDataHandlerFunc(req, res) {
    let text = req.query.text;
    let date = req.query.date;
    console.log(req.query);
    let url = `https://api.covid19api.com/country/${text}/status/confirmed/live?from=${date}&to=${date}`;

    superagent.get(url)
        .then((data=>data.body.Countries.map(result => new Statistics(result.data))))
        .then(() => {
            res.render('statictics', { object: object })
        })
    console.log(data);
}

function Statistics(object) {
    this.date = object.date;
    this.text = object.text;
}

server.get('/Allcountry', allCountryHandlFun)
function allCountryHandlFun(req, res) {
    let city = req.body.name;
    let url = `https://api.covid19api.com/live/country/${city}/status/confirmed`;

    superagent.get(url)
        .then(result => result.body.map(val => new Allcountries(val.result)))
        .then(() => {
            res.render('/allcountry', { body: result })
        })
}

function Allcountries(val) {
    this.country = val.Country || 'no data ';
    this.Confirmed = val.Confirmed || 'no data ';
    this.Deaths = val.Deaths || 'no data ';
    this.Recovered = val.Recovered || 'no data ';
    this.date = val.Date || 'no date found';
}

server.get('/records', AddtoMyRec)
function AddtoMyRec(req, res) {
    let SQL = `INSERT INTO covid (Country,Recovered,Confirmed,Deaths,Date)  VALUES ($1,$2,$3,$4,$5);`;
    let { Country,Recovered,Confirmed,Deaths,Date } = req.body;
    let values = [Country,Recovered,Confirmed,Deaths,Date];
console.log(req.body);
    client.query(SQL, values)
        .then(() => {
            res.redirect('/retrieveFromDb');
        })
}

server.get('/retrieveFromDb', renderData)
function renderData(req, res) {
    let SQL = `SELECT * FROM covid`;
    let { Country,Recovered,Confirmed,Deaths,Date } = req.body;
    let values = [Country,Recovered,Confirmed,Deaths,Date];

client.query(SQL,values)
.then((data=>{
    res.render('records',{obj:data.rows})
}))
}

server.get('/details',detailsPage)
function detailsPage(req,res){
let SQL=`SELECT * FROM covid WHERE id=$1`;
let id = req.params.ID;
let value=[id];

client.query(SQL,value)
.then(()=>{
    res.redirect(`/details/${id}`,{result:result.rows[0]})
})
}

server.get('/details/:ID',renderDetail)
function renderDetail(req,res){
res.render('details');
}

server.put('/updateForm/:ID',updateHandlerFun)
function updateHandlerFun(req,res){
    let SQL=`UPDATE SET Country=$1 ,Recovered=$2,Confirmed=$3,Deaths=$4,DATE=$5 WHERE id=$6; `;
    let id=req.params.ID;
    let {Country,Recovered,Confirmed,Deaths,Date}=req.body;
    let value =[Country,Recovered,Confirmed,Deaths,Date,id];

    client.query(SQL,value)
        .then(()=>{
            res.redirect('/details/${id}')
        })
    
}

server.delete('/deleteForm/:ID',deleteHandlerFun)
function deleteHandlerFun(req,res){
    let SQL=`DELETE * FROM covid WHERE id=$1 `;
    let id=req.params.ID;
    let value =[id];

    client.query(SQL,value)
        .then(()=>{
            res.redirect('/record')
        })
    
}







client.connect()
    .then((
        server.listen(PORT, () => console.log(`I am listening to port ${PORT}`))
    ));
