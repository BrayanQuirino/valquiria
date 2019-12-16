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
let tercer='3.ᵉʳ';
let primer= '1.ᵉʳ';
let segundo='2.º';
async function qry(string,peticion){
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
        }else if(res != undefined && res != null){
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
  async function qryAll(string,peticion){
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
        }else if(res != undefined && res != null){
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
        }else if(res != undefined && res != null){
          for(i=0;i<3;i++){
            var json={}
            json.ua=res.rows[i].u_admi;
            json.acumulado=res.rows[i].u_admi;
            respuesta.push(json);
            console.log(respuesta[i]);
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
    console.log('Lo que llego',trimestre);
    switch(trimestre){
      case 'este','ultimo','último':
        mes=s(date.getMonth()+1);
        return mes;
        break;
      case 'primero', 'primer','1.??','1.ᵉʳ',1,primer:
        return 3;
        break;
      case 'segundo', 'intermedio','2.º',2,segundo:
        return 6;
        break;
      case 'tercero','tercer','3.ᵉʳ','3.??',3,tercer:
        return 9;
        break;
      default:
        return s(date.getMonth()+1);
        break;
    }
  }
  exports.qry=qry;
  exports.qryPalmas=qryPalmas;
  exports.s=s;
  exports.qryAll=qryAll;
  exports.sName=sName;
