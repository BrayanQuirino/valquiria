const fs=require('fs');
const parser= require('body-parser');
const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'examen',
  password: 'postgres',
  port: 5432,
})
let lecdata= fs.readFileSync('copy.json');
let trans = JSON.parse(lecdata);
let count= Object.keys(trans).length;
for (i=0; i<count; i++){
const json= trans[i].answer;
pool.query("INSERT INTO answers (answer) VALUES( '" +json+ "' );", (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
   /* const data= JSON.stringify(res.rows);
    fs.writeFile('copy.json',data,function(err){
	if(err){
	  throw err;
	}
	console.log('JSON created sucessfuly');
    });*/
    console.log("Insert sucessfuly"+ json);
}
})
}
pool.end();
