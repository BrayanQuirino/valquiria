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
pool.query('SELECT * FROM answers;', (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    const data= JSON.stringify(res.rows);
    fs.writeFile('prueba.json',data,function(err){
	if(err){
	  throw err;
	}
	console.log('File was created sucessfully');
        let lecdata= fs.readFileSync('prueba.json');
        let json= JSON.parse(lecdata);
        console.log(json);
    });
}
  pool.end()
})


