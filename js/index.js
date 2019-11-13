/**
 * @author Brayan Quirino
 * Programa realizado por Brayan Quirino
  Con ayuda del archivo connection.js este prgrama recibe el Intent de Alexa y dependiendo cual sea el caso
  hace un consulta a la base de datos- especificamente a la tabla mir.
 */
/**
 * @param port puerto 443 pedido por Alexa
 * @param alexaVerifier verifica que la peticiones sean de Alexa
 * @param peticion Lo que quiere el usuario de la tabla para generalizar un qry: ¡NO SE ESTÁ USANDO!
 * @param lastIntent Guarda el valor del ultimo Intenten para generalizar el AMAZON.YesIntent(para que sea mejor la comunicación con el usuario).
 * @param nivel Variable global que guarda el nivel(F1,F2,etc)
 * @param pp variable que guarda el nombre del programa presupuestal
 * @param isFisrtTime bandera para saber si el usuario ya habia iniciado previamente
 * @param XXXX_XXX constantes que son mensajes
 * @param httpsOptions variable que obtiene el certificado y llave del servidor
 */
const fs=require('fs');
const path=require('path');
const https=require('https');
const Speech = require ('ssml-builder');
let con=require('./connection');
let express = require('express'),
  bodyParser = require('body-parser'),
  port = 443,
  app = express();
let alexaVerifier = require('alexa-verifier');
let peticion;
let lastIntent='';
let nivel;
let pp;
var isFisrtTime = true;
const directoryToServe='client'
const SKILL_NAME = 'valquiria';
let WELCOME_MESSAGE='Bienvenido al nuevo SISC ';
const HELP_MESSAGE = 'Puedes decir ayuda, o, salir... ¿Qué quieres hacer?';
const HELP_REPROMPT = '¿En qué puedo ayudarte?';
const MORE_MESSAGE = '¿Quieres saber más?';
const STOP_MESSAGE = 'Disfruta el día...adios!';
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered">';
const CLOSE_WHISPER ='</amazon:effect>';
const httpsOptions ={
	cert:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/fullchain.pem"),
	key:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/privkey.pem")
}
/**
 * Se muestra Hello word en http; puerto extra
 */
app.get('/',function(req,res){
	res.send('hello Wordl!');
});
app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
/**
 * @function flecha funcion asincrona que hace toda la distribucion y llamadas de otras funciones.
 */
app.post('/valquiria', requestVerifier, async function(req, res) {

  if (req.body.request.type === 'LaunchRequest') {
    res.json(welcome());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End")
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case 'AMAZON.YesIntent':
        let rar= await yes();
        res.json(rar);
        break;
      case 'AMAZON.NoIntent':
        lastIntent=req.body.request.intent.name;
        res.json();
        break;
      case 'AMAZON.HelpIntent':
        lastIntent=req.body.request.intent.name;
        res.json(help());
        break;
      case 'principal':
        lastIntent=req.body.request.intent.name;
        peticion='porcentaje';
        let date=new Date();
        let mes=date.getMonth()+1;
        let year=date.getFullYear();
        nivel=req.body.request.intent.slots.nivel.value.toUpperCase();
        pp=req.body.request.intent.slots.pp.value.toUpperCase();
        let re=await select(peticion,year,pp,nivel,mes);
        res.json(re);
        break; 
      default:

    }
  }
});
/**
 * @function yes funcion que esta correlacionada con el intent Amazon.YesIntent
 */
async function yes(){
  switch(lastIntent){
    case 'principal':
      let date=new Date();
      let mes=date.getMonth()+1;
      let year=date.getFullYear();
      let re=await selectAll(year,pp,nivel,mes);
      return re;
      break; 
  }

}
function requestVerifier(req, res, next) {
    alexaVerifier(
      req.headers.signaturecertchainurl,
      req.headers.signature,
      req.rawBody,
      function verificationCallback(err) {
        if (err) {
          res.status(401).json({
            message: 'Verification Failure',
            error: err
          });
        } else {
          next();
        }
      }
    );
  }
  function log() {
    if (true) {
      console.log.apply(console, arguments);
    }
  }
  function handleDataMissing() {
    return buildResponse(MISSING_DETAILS, true, null)
  }
  
  function stopAndExit() {
  
    const speechOutput = STOP_MESSAGE
    var jsonObj = buildResponse(speechOutput, true, "");
    return jsonObj;
  }
/**
 * @function help funcion relacionada con el intent help
 * @function welcome funcion relacionada con el intent principal
 */
  function help() {
  
    const speechOutput = HELP_MESSAGE
    const reprompt = HELP_REPROMPT
    var jsonObj = buildResponseWithRepromt(speechOutput, false, "", reprompt);
  
    return jsonObj;
  }
  
  function welcome() {

    if (!isFisrtTime) {
      WELCOME_MESSAGE = '';
    }
    const tempOutput = WELCOME_MESSAGE+ PAUSE;
    const speechOutput = tempOutput + HELP_REPROMPT
    const more = MORE_MESSAGE
    return buildResponseWithRepromt(speechOutput, false, 'WELCOME', more);
  
  }
  /**
   * @function buildResponse funcion que formatea la salida a un ssml pero sin repromt
   * @function buildResponseWithRepromt plus de buildResponse
   */
  function buildResponse(speechText, shouldEndSession, cardText) {
  
    const speechOutput = "<speak>" + speechText + "</speak>"
    var jsonObj = {
      "version": "1.0",
      "response": {
        "shouldEndSession": shouldEndSession,
        "outputSpeech": {
          "type": "SSML",
          "ssml": speechOutput
        },
        "card": {
          "type": "Simple",
          "title": SKILL_NAME,
          "content": cardText,
          "text": cardText
        }
      }
    }
    return jsonObj
  }
  
  function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt) {
  
    const speechOutput = "<speak>" + speechText + "</speak>"
    var jsonObj = {
       "version": "1.0",
       "response": {
        "shouldEndSession": shouldEndSession,
         "outputSpeech": {
           "type": "SSML",
           "ssml": speechOutput
         },
       "card": {
         "type": "Simple",
         "title": SKILL_NAME,
         "content": cardText,
         "text": cardText
       },
       "reprompt": {
         "outputSpeech": {
           "type": "PlainText",
           "text": reprompt,
           "ssml": reprompt
         }
       }
     }
   }
    return jsonObj
  }    
/**
 * 
 * @param {slecet} peticion la peticion del usuario(el dato a seleccionar)
 * @param {select} anno año del dato a solicitar
 * @param {select} pp programa presupuestal
 * @param {select} nivel nivel (F1,F2,etc)
 * @param {select} mes mes que se quiere saber.
 */
async function select(peticion,anno,pp,nivel,mes){
    let string= "SELECT "+peticion+" FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes_num= "+mes+" and nivel= '"+nivel+"' and u_admi like 'TOTAL';";
    let respuesta= await con.qry(string,peticion);
    const speechOutput= 'Vamos al '+respuesta+' '+ MORE_MESSAGE;
    //console.log(speechOutput);
    const reprompt = HELP_REPROMPT
    var jsonObj= buildResponseWithRepromt(speechOutput, false, "SELECT", reprompt);
   return await jsonObj;
  }
/**
 * 
 * @param {selectAll} anno 
 * @param {selectAll} pp 
 * @param {selectAll} nivel 
 * @param {selectAll} mes 
 */
async function selectAll(anno,pp,nivel,mes){
    let string= "SELECT * FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes_num= "+mes+" and nivel= '"+nivel+"' and u_admi like 'TOTAL';";
    let respuesta= await con.qryAll(string,peticion);
    const speechOutput= 'Este mes hemos realizado '+respuesta[2]+ ' actividades, acumulando un total de '+ respuesta[1]+'. Lo programado fueron '
    + respuesta[1]+ ' actividades '+PAUSE+'asi que tenemos una diferiencia de '+respuesta[3]+PAUSE+' '+ MORE_MESSAGE;
    //console.log(speechOutput);
    const reprompt = HELP_REPROMPT
    var jsonObj= buildResponseWithRepromt(speechOutput, false, "SELECT", reprompt);
   return await jsonObj;
  }
/**
 * Se enciende el servidor http:8180, https:443
 */
app.listen(8180);
https.createServer(httpsOptions,app).listen(port,function(){
	console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);	
})
console.log('Alexa list RESTful API server started on: ' + port);
