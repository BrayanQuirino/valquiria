/*Programa realizado por Brayan Quirino
 * Programa que obtine los datos de un JSON y los inserta en la bd examen*/
const fs=require('fs');
const parser= require('body-parser');
//La variable Pool es la conexion a la BD
const { Pool} = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'examen',
  password: 'postgres',
  port: 5432,
})
//Abrimos el archivo
let lecdata= fs.readFileSync('../json/copy.json');
//Formateamos los datos
let trans = JSON.parse(lecdata);
//Obtenemos el numero de estructuras u objetos JSON dentro del archivo
let count= Object.keys(trans).length;
for (i=0; i<count; i++){
//Obtenemos el dato especifico que nos interesa	
const json= trans[i].answer;
//Insertamos en la BD
pool.query("INSERT INTO answers (answer) VALUES( '" +json+ "' );", (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log("Insert sucessfuly"+ json);
}
})
}
pool.end();
