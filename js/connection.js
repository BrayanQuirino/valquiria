/*Programa realizado por Brayan Quirino
 Archivo que obtiene todos los datos de una tabla y los imprime en un archivo(prueba.js) como en la consola.
 */
const fs=require('fs');
const parser= require('body-parser');
//Pool es la variable que consigue la conexcion con la BD
const {Pool} = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'valquiria',
  password: 'postgres',
  port: 5432,
})
//Usamos el metodo query
pool.query('SELECT * FROM mir;', (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    //formateamos los datos y escribimos el archivo
    const data= JSON.stringify(res.rows);
    fs.writeFile('../json/prueba.json',data,function(err){
	if(err){
	  throw err;
	}
	//Abrimos el archivo creado, formateamos los datos e imprimimos.
	console.log('File was created sucessfully');
        let lecdata= fs.readFileSync('../json/prueba.json');
        let json= JSON.parse(lecdata);
        console.log(json);
    });
}
  pool.end()
})

