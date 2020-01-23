/**
 * Programa realizado por Brayan Quirino
 * @param pool consigue la conexion a la BD
 * @param nodemailer variable que nos ayuda a mandar emails
 */
let {Pool} = require('pg');
let nodemailer = require('nodemailer');
require('dotenv').config();
/**
 * @param tercer objeto que contiene las posibles formas de decir tercero
 * @param segundo objeto que contiene las posibles formas de decir segundo
 * @param primer objeto que contiene las posibles formas de decir primer
 */
let tercer={tr:'3.ᵉʳ', t:'3'};
let primer={pr: '1.ᵉʳ',p:'1'};
let segundo={sr:'2.º',s:'2'};
/**
 * @param transporter objeto que obtiene las credenciales del correo valquiria
 */
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
  });
/**
 * @param mailOptions objeto que contiene los detalles del correo
 */
var mailOptions = {
  from: 'valquiriasisc@gmail.com',
  to: 'dracko.bq@gmail.com , banser.100@gmail.com',
  subject: 'Informacíon',
  text: ''
};
/**
 * Funcion que realiza un query de acuerdo a string solicitando unicamente el porcentaje
 * @param {*} string 
 */
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
   * Funcion que realiza un query de acuerdo a string solicitando lo programado, el aucmulado, lo realizado y la diferiencia
   * @param {*} string 
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
  /**
   * Funcion que hace un query de acuerdo a string solicitando por lo menos una unidad y como maximo tres
   * unidades con mayor porcentaje dle avance
   * @param {*} string 
   */
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
  /**
   * Funcion que hace un query de a cuerdo a string solicitando los resultados de los meses ateriores
   * @param {*} string 
   */
  async function qryPre(string){
    let pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'valquiria',
      password: 'postgres',
      port: 5432,
    })
    let respuesta=[];
    console.log(string);
    await pool.query(string, (err, res) => {
	if (err) {
           console.log(err.stack)
        }else if(res != undefined && res != null && res.rowCount>0){
            for(i=0;i<res.rowCount;i++){
              var json={}
              json.programado=res.rows[i].programado;
              json.acumulado=res.rows[i].acumulado;
              json.realizado=res.rows[i].realizado;
              json.diferencia=res.rows[i].diferencia;
              respuesta.push(json);
              console.log(json);
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
  /**
   * Funcion que hace la conversion de los numeros ordinales o strings a arabigos 
   * @param {*} trimestre 
   */
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
  /**
   * Funcion que dado un trimestre hace la conversion de arabigo a string
   * @param {*} trim 
   */
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
/**
 * Funcion que manda el email con el texto de la variable texto
 * @param {F} texto 
 */
function sendEmail(texto){
  mailOptions.text=texto;
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    }
  });
}
  exports.qry=qry;
  exports.qryPalmas=qryPalmas;
  exports.s=s;
  exports.qryAll=qryAll;
  exports.sName=sName;
  exports.ordinal=ordinal;
  exports.qryPre=qryPre;
  exports.sendEmail=sendEmail;
