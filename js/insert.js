/*Programa realizado por Brayan Quirino
 * Programa que obtine los datos de un JSON y los inserta en la bd examen*/
const fs=require('fs');
//const path=require('path');
//La variable Pool es la conexion a la BD
const {Pool} = require('pg')
let pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'valquiria',
  password: 'postgres',
  port: 5432,
})
let string='';
let anno=['2018','2019','2020'];
let programa=['E010','E011','E012','E013','E016','E021','E022','E041','E042','E043','P003','R070','S243','S268','S303','U281'];
//Abrimos el archivo
for(i in anno){
    for (j in programa){
            if(fs.existsSync('../../jsons/salida_'+programa[j]+'_'+anno[i]+'.json')){
                console.log(anno[i],programa[j]);
                let lecdata= fs.readFileSync('../../jsons/salida_'+programa[j]+'_'+anno[i]+'.json');
                //Formateamos los datos
                let trans = JSON.parse(lecdata);
                //Obtenemos el numero de estructuras u objetos JSON dentro del archivo
                let count= Object.keys(trans).length-1;
                for (z=0; z<count; z++){
                    //Obtenemos el dato especifico que nos interesa	
                    let meta=trans[z].meta;
                    let u_admi=trans[z].u_siglas;
                    let nivel=trans[z].smir_sid;
                    //La funcion nombre solo se usara si no tengo el nombre del mes
                    let mes=nombre(trans[z].mes);
                    let mes_num=trans[z].mes;
                    let programado=trans[z].acum_meta;
                    let acumulado=trans[z].acum_avance;
                    let realizado=trans[z].avance;
                    let diferencia=programado-acumulado;
                    let porcentaje;
                    if(programado<=0){
                        porcentaje= '-';
                    }else{
                        porcentaje=((acumulado*100)/programado).toFixed(2);
                        
                    }
                    let array=[meta,u_admi,nivel,mes,mes_num,programado,acumulado,realizado,diferencia,porcentaje];
                    for( w in array){
                        if(array[w]==null || array[w]==undefined){
                            array[w]=0;
                        }
                    }
                    string+="INSERT INTO mir (meta,u_admi,nivel,mes,mes_num,programado,acumulado,realizado,diferencia,porcentaje,anno,programa) VALUES( " +array[0]+ ",'"+array[1]+"','"+array[2]+"','"+array[3]+"',"+array[4]+","+array[5]+","+array[6]+","+array[7]+","+array[8]+",'"+array[9]+"%','"+anno[i]+"','"+programa[j]+"');\n"
                }
        }
    }
}
pool.query(string, (err, res) => {
                    if (err) {
                        console.log(err.stack)
                    }
                    })
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
