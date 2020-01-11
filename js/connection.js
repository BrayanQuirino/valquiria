/**
 * Programa realizado por Brayan Quirino
 * @param pool consigue la conexion a la BD
 */
let {Pool} = require('pg');
/**
 * @function qry funcion asincron aque obtiene solamente el porcentaje
 * @param {qry} string la consulta
 * @param {qry} peticion SIGO TRABAJANDO EN GENERALIZAR LAS CONSULTAS
 */
let tercer={tr:'3.ᵉʳ', t:'3'};
let primer={pr: '1.ᵉʳ',p:'1'};
let segundo={sr:'2.º',s:'2'};
async function qry(string){
    let pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'valquiria',
      password: 'postgres',
      port: 5432,
    })
    //variable que es el resultado del query
    let respuesta;
    await pool.query(string, (err, res) => {
        if (err) {
           console.log(err.stack)
        }else if(res != undefined && res != null && res.rowCount>0){
            respuesta= res.rows[0].porcentaje;
        }else{
          respuesta= null;
        }
        })
    await pool.end();
    //console.log(respuesta);
    return respuesta;
  }
  /**
   * @function qryAll funcion que obtiene todos los datos de un tupla de la tabla mir
   * @param {qryAll} string la consulta
   * @param {qryAll} peticion PUEDE QUE ELIMINE ESTO
   */
  async function qryAll(string){
    let pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'valquiria',
      password: 'postgres',
      port: 5432,
    })
    let respuesta=[];
    await pool.query(string, (err, res) => {
        if (err) {
           console.log(err.stack)
        }else if(res != undefined && res != null && res.rowCount>0){
            respuesta.push(res.rows[0].programado);
            respuesta.push(res.rows[0].acumulado);
            respuesta.push(res.rows[0].realizado);
            respuesta.push(res.rows[0].diferencia);
        }else{
          respuesta=null;
        }
        })
    await pool.end();
    return respuesta;
  }
  async function qryPalmas(string){
    let pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'valquiria',
      password: 'postgres',
      port: 5432,
    })
    let respuesta=[];
    await pool.query(string, (err, res) => {
	if (err) {
           console.log(err.stack)
        }else if(res != undefined && res != null && res.rowCount>0){
          if(res.rowCount>=3){
            for(i=0;i<3;i++){
              var json={}
              json.ua=res.rows[i].u_admi;
              json.acumulado=res.rows[i].acumulado;
              respuesta.push(json);
            }  
          }else{
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.ua=res.rows[i].u_admi;
              json.acumulado=res.rows[i].acumulado;
              respuesta.push(json);
            }  
          }
        }else{
          respuesta=null;
        }
        })
    await pool.end();
    return respuesta;
  }
  //Funcion que sirve para pedir el trimestre.
  function s(mes){
    switch(mes){
      case 3,4,5:
        return 3;
        break;
      case 6,7,8:
        return 6;
        break;
      case 9,10,11:
        return 9;
        break;
      default:
        return mes;
        break;
    }
  }
  function sName(trimestre){
    let date=new Date();
    let mes;
    //console.log('Lo que llego',trimestre);
    switch(trimestre){
      case 'este','ultimo','último':
        mes=s(date.getMonth()+1);
        return mes;
        break;
      case 'primero', 'primer','1.??','1.ᵉʳ','1',1,primer.pr,primer.p:
        return 3;
        break;
      case 'segundo', 'intermedio','2.º','2,',2,segundo.sr,segundo.s:
        return 6;
        break;
      case 'tercero','tercer','3.ᵉʳ','3.??','3,',3,tercer.tr,tercer.t:
        return 9;
        break;
      default:
        return s(date.getMonth()+1);
        break;
    }
  }
  function ordinal(trim){
   switch(trim){
     case 3:
       return 'primer';
       break;
      case 6:
        return 'segundo';
        break;
      case 9: 
        return 'tercer';
        break;
      case 12:
        return 'cuarto';
        break;
   } 
  }
  exports.qry=qry;
  exports.qryPalmas=qryPalmas;
  exports.s=s;
  exports.qryAll=qryAll;
  exports.sName=sName;
  exports.ordinal=ordinal;
