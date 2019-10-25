/*Programa realizado por Brayan Quirino
 * Programa que obtine los datos de un JSON y los inserta en la bd examen*/
const fs=require('fs');
const parser= require('body-parser');
//La variable Pool es la conexion a la BD
const { Pool} = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'valquiria',
  password: 'postgres',
  port: 5432,
})
//Abrimos el archivo
let lecdata= fs.readFileSync('../json/prueba.json');
//Formateamos los datos
let trans = JSON.parse(lecdata);
//Obtenemos el numero de estructuras u objetos JSON dentro del archivo
let count= Object.keys(trans).length;
for (i=0; i<count; i++){
//Obtenemos el dato especifico que nos interesa	
const avance= trans[i].avance;
const u_administrativa=trans[i].u_administrativa;
//La funcion nombre solo se usara si no tengo el nombre del mes
const mes=nombre(trans[i].mes_num);
const mes_num=trans[i].mes_num;
const programado=trans[i].programado;
const acumulado=trans[i].acumulado;
const realizado=trans[i].realizado;
const diferencia=programado-acumulado;
let porcentaje;
if(programado<=0){
  porcentaje= '-';
}else{
  porcentaje=(acumulado*100)/programado;
}
//Insertamos en la BD
pool.query("INSERT INTO mir (avance,u_administrativa,mes,mes_num,programado,acumulado,realizado,diferencia,porcentaje) VALUES( '" +avance+ "','"+u_administrativa+"','"+mes+"',"+mes_num+","+programado+","+acumulado+","+realizado+","+diferencia+",'"+porcentaje+"%');", (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log("Insert sucessfuly"+ avance,u_administrativa);
}
})
}
pool.end();

function nombre(mes){
 switch(mes){
  case 1:
   return 'enero';
   break;
  case 2:
   return 'febrero';
   break;
  case 3:
   return 'marzo';
   break;
  case 4:
   return 'abril';
   break;
  case 5:
   return 'mayo';
   break;
  case 6:
   return 'junio';
   break;
  case 7:
   return 'julio';
   break;
  case 8:
   return 'agosto';
   break;
  case 9:
   return 'septiembre';
   break;
  case 10:
   return 'octubre';
   break;
  case 11:
   return 'noviembre';
   break;
  case 12:
   return 'diciembre';
   break;
 }
}
