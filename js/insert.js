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
  password: '',
  port: 5432,
})
let anno=['2018','2019','2020'];
let programa=['E011','E012','E013','E016','E021','E022','E041','E042','E043','P003','R070','S243','S268','S303','U281'];
//Abrimos el archivo
for(i in anno){
    for (j in programa){
        let lecdata= fs.readFileSync('../../../salida_"'+programa[j]+'"_"'+anno[i]+'".json');
        //Formateamos los datos
        let trans = JSON.parse(lecdata);
        //Obtenemos el numero de estructuras u objetos JSON dentro del archivo
        let count= Object.keys(trans).length;
        for (z=0; z<count; z++){
        //Obtenemos el dato especifico que nos interesa	
        const meta=trans[z].meta;
        const u_admi=trans[z].u_siglas;
        const nivel=trans[z].smir_sid;
        //La funcion nombre solo se usara si no tengo el nombre del mes
        const mes=nombre(trans[z].mes);
        const mes_num=trans[z].mes;
        const programado=trans[z].acum_meta;
        const acumulado=trans[z].acum_avance;
        const realizado=trans[z].avance;
        const diferencia=programado-acumulado;
        let porcentaje;
        if(programado<=0){
        porcentaje= '-';
        }else{
        porcentaje=(acumulado*100)/programado;
        }
        //Insertamos en la BD
        pool.query("INSERT INTO mir (meta,u_admi,nivel,mes,mes_num,programado,acumulado,realizado,diferencia,porcentaje) VALUES( '" +meta+ "','"+u_admi+"','"+nivel+"',"+mes+","+mes_num+","+programado+","+acumulado+","+realizado+","+diferencia+",'"+porcentaje+"%');", (err, res) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log("Insert sucessfuly"+ avance,u_administrativa);
        }
        })
        }
    }
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
