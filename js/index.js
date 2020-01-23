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
let pre=require('./prediccion');
let express = require('express'),
  bodyParser = require('body-parser'),
  port = 443,
  app = express();
let alexaVerifier = require('alexa-verifier');
let peticion;
let lastIntent='';
let mes;
let nivel;
let pp;
let date;
let re;
let speechOutput;
let conjugacion=true;
var isFisrtTime = true;
var confimation1=false;
var confimation2=false;
const directoryToServe='client'
const SKILL_NAME = 'Valquiria';
let WELCOME_MESSAGE='Bienvenido al nuevo SISC ';
const HELP_REPROMPT = '¿En qué puedo ayudarte?';
const MORE_MESSAGE = '¿Quieres saber más?';
const STOP_MESSAGE = 'Disfruta el día...adios!';
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered">';
const CLOSE_WHISPER ='</amazon:effect>';
const HELP_MESSAGE = 'En cualquier programa presupuestal,'+PAUSE+' con su respectivo nivel, puedo decirte como vamos actualmente.' 
+' También puedo decirte el avance por trimestre,'+PAUSE+' incluso puedes saber “quién se llevó las palmas”'
+PAUSE+WHISPER+' ósea quien trabajo más. '+CLOSE_WHISPER+PAUSE+'Otra cosa que puedo hacer, es predecir el mes siguiente en algún programa presupuestal.'
+PAUSE+' Además, puedo enviarte un correo de alguna consulta que hayas hecho. '+PAUSE+'¿Qué quieres hacer?'+PAUSE+' Para salir solo di'+PAUSE+' "para" '+PAUSE+' o '+PAUSE+'"salir."';
const httpsOptions ={
	cert:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/fullchain.pem"),
	key:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/privkey.pem")
}
// names es un array que tiene 5 posibles respuestas al intent name, el cúal es un poco de sarcasmo
let names=['name1 será remplazado con éxito.', '¿name1?'+PAUSE+' Ahora solo existe Alexa.','No, Alexa hace mucho más que name1',WHISPER+'Claro, pero no se lo digas a name1'+CLOSE_WHISPER,'Si'+PAUSE+' ¡Y el siguiente serás tú!','Umm... si,'+PAUSE+' Ulises será remplazado'];
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
 * @function esta función atiende todas las solicitudes de alexa, dependiendo del tipo de solicitud atiende con distintas subfunciones
 */
app.post('/valquiria', requestVerifier, async function(req, res) {

  if (req.body.request.type === 'LaunchRequest') {
    re=welcome();
    res.json(re);
    isFisrtTime = false;
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */ 
      log("Session End");
      req.body.session.new=true;
      //res.json(welcome());
  } else if (req.body.request.type === 'IntentRequest') {
    /**
     * Cada intent tiene su respectiva subfuncion. Cuando un intent es llamado la variable lastIntent es actualizada con el intent llamado
     * el objetivo de lastIntent es generalizar Amazon.YesIntent ya que la logica de la aplicacion sugiere varios "si" como
     * respuest del usuario. Concorde a esto, cuando el intent Amazon.YesIntent es llamado realiza una funcion dependiendo 
     * del intent anterior, dicho de otro modo, Amazon.YesIntent se se ramifica en distintas operaciones.
     */
      date=new Date();
      let year=date.getFullYear();
    switch (req.body.request.intent.name) {
      case 'AMAZON.YesIntent':
        re= await yes(year,pp,nivel,mes);
        res.json(re);
	      confirmation1=confirmation2=false;
        break;
      case 'AMAZON.NoIntent':
        re=no();
        res.json(re);
	      confirmation1=confirmation2=false;
        break;
      case 'AMAZON.HelpIntent':
        lastIntent=req.body.request.intent.name;
        re=help();
        res.json(re);
	      confirmation1=confirmation2=false;
        break;
      case 'AMAZON.RepeatIntent':
        if(re!= undefined && re != null){
          res.json(re);
        }else{
          re=nose();
          res.json(re);
        }
        break;
      case 'AMAZON.StopIntent':
        re=stopAndExit();
        res.json(re);
        break;
      case 'principal':
        lastIntent=req.body.request.intent.name;
        peticion='porcentaje';
        mes=date.getMonth()+1;
        //console.log(req.body.request.intent.slots);
        await resolutionsPp(req.body.request.intent);
        await resolutionsNivel(req.body.request.intent);
        re=await select(peticion,year,pp,nivel,mes,'vamos al ');
	      confirmation1=confirmation2=false;
        res.json(re);
        break;
        /**
         * el intent palmas es el unico que puede ser llamado después de una consulta anterior para usar esos datos
         * y tambien es llamado desde ceros cuando el usuario otorga los datos pp y nivel
         */
      case 'palmas':
          //console.log(req.body.request.intent);
          peticion='porcentaje';
          if((req.body.request.intent.slots.pp.value==undefined || req.body.request.intent.slots.pp.value == null) || (req.body.request.intent.slots.nivel.value==undefined || req.body.request.intent.slots.nivel.value == null)){
            if(lastIntent=='principal'){
                re = await selectPalmas(year,pp,nivel,mes,PAUSE+'quien se lleva las palmas es...'+PAUSE);
                res.json(re);
            }else if(lastIntent=='trimestre'){
              if(conjugacion){
                re = await selectPalmas(year,pp,nivel,mes,PAUSE+'quien se lleva las palmas este trimestre es...'+PAUSE);
                res.json(re);
              }else{
                re = await selectPalmas(year,pp,nivel,mes,PAUSE+'quien se llevó las palmas fue...'+PAUSE);
                res.json(re);
            }
            }else if(lastIntent=='anual'){
              re = await selectPalmas(year,pp,nivel,mes,PAUSE+'este año quien se lleva las palmas es...'+PAUSE);
              res.json(re);
            }else{
              if(confimation1 || (req.body.request.intent.slots.pp.value!=undefined && req.body.request.intent.slots.pp.value != null)){
                  if(!confimation2){
                    await resolutionsPp(req.body.request.intent);
                    confimation2=true;
                  }
                  if(req.body.request.intent.slots.nivel.value== undefined || req.body.request.intent.slots.nivel.value== null){
                    re=palmasSlotnivel();
                    res.json(re);
                  }else{
                    await resolutionsNivel(req.body.request.intent);
                    mes=date.getMonth()+1;
                    re=await selectPalmas(year,pp,nivel,mes,PAUSE+'quien se lleva las palmas es...'+PAUSE);
                    res.json(re);  
                  }
              }else if((req.body.request.intent.slots.pp.value== undefined || req.body.request.intent.slots.pp.value== null)){
                re=palmasSlotpp();
                res.json(re);
                confimation1=true;
              }
            }
          }else{
            await resolutionsPp(req.body.request.intent);
            await resolutionsNivel(req.body.request.intent);
            mes=date.getMonth()+1;
            re=await selectPalmas(year,pp,nivel,mes,PAUSE+'quien se lleva las palmas es...'+PAUSE);
            res.json(re);
            confirmation1=confimation2=false;  
          }
          lastIntent=req.body.request.intent.name;
          break;
      case 'trimestre':
        lastIntent=req.body.request.intent.name;
        peticion='porcentaje';
        date=new Date();
	      //console.log('El valor',req.body.request.intent.slots.trim.value);
        mes=con.sName(req.body.request.intent.slots.trim.value);
        //console.log('El mes',mes);
        var auxconjugacion=PAUSE+'en el '+con.ordinal(mes)+' trimestre vamos al ';
        if(con.sName(date.getMonth()+1)>mes){
          conjugacion=false;
          auxconjugacion=PAUSE+'en el '+con.ordinal(mes)+' trimestre íbamos al ';
        }else{
          conjugacion=true;
        }
	      await resolutionsPp(req.body.request.intent);
	      await resolutionsNivel(req.body.request.intent);
        re=await select(peticion,year,pp,nivel,mes,auxconjugacion);
        res.json(re);
	      confirmation1=confirmation2=false;
        break;
      case 'anual':
        lastIntent=req.body.request.intent.name;
        peticion='porcentaje';
        mes=12;
        //console.log(req.body.request.intent.slots);
        await resolutionsPp(req.body.request.intent);
        await resolutionsNivel(req.body.request.intent);
        re=await select(peticion,year,pp,nivel,mes,' este año vamos al ');
	      confirmation1=confirmation2=false;
        res.json(re);
        break;  
      case 'prediccion':
        lastIntent=req.body.request.intent.name;
        mes=date.getMonth()+1;
        await resolutionsNivel(req.body.request.intent);
        await resolutionsPp(req.body.request.intent);
        re=await selectPre(year,pp,nivel,mes);
        res.json(re);
        confirmation1=confirmation2=false;
        break;
      case 'names':
        lastIntent=req.body.request.intent.name;
        confirmation1=confirmation2=false;
        var speechOutput;
        if(req.body.request.intent.slots.nombre.value!=undefined &&req.body.request.intent.slots.nombre.value!=null){
          var indice=Math.round(Math.random() * (names.length-2));
          var string=names[indice];
          speechOutput=string.replace('name1',req.body.request.intent.slots.nombre.value);
        }else{
          speechOutput=names[names.length-1];
        }        
        re=buildResponse(speechOutput, false, 'NO');
        res.json(re);
        confirmation1=confirmation2=false;
        break;
      case 'email':
        lastIntent=req.body.request.intent.name;
        con.sendEmail(clean());
        confirmation1=confirmation2=false;
        re=send();
        res.json(re);
        break;
      default:
        res.json(nose());
	      confirmation1=confirmation2=false;
        break;
    }
  }
});
/**
 * @function yes funcion que esta correlacionada con el intent Amazon.YesIntent
 */
async function yes(year,pp,nivel,mes){
  let re;
  let string='';
  if(lastIntent=='principal'){
    string='hemos realizado ';
  }else if(lastIntent=='trimestre'){
    if(conjugacion){
      string='este trimestre realizamos '
    }else{
      string='realizamos ';
    }
  }else if(lastIntent='anual'){
    string='este año hemos realizado';
  }
  re=await selectAll(year,pp,nivel,mes,string);
  return re;
}
/**
 * 
 * @param {*} intent esta funcion recibe el intent llamado y verifica si existe un match entre lo que dijo el usuario y los datos posibles 
 * del sistema de acuerdo a los programas presupuestales
 */
function resolutionsPp(intent){
  if(intent.slots.pp.resolutions.resolutionsPerAuthority[0].status.code==='ER_SUCCESS_MATCH'){
    pp=intent.slots.pp.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    //let values=JSON.stringify(intent.slots.pp.resolutions.resolutionsPerAuthority);
    //console.log(values);
    //console.log('pp:', intent.slots.pp.resolutions.resolutionsPerAuthority[0].values[0].value.name);
  }else{
    pp=intent.slots.pp.value.toUpperCase();
  }
}
/**
 * 
 * @param {*} intent esta funcion recibe el intent llamado y verifica si existe un match entre lo que dijo el usuario y los datos posibles 
 * del sistema de acuerdo a los niveles
 */
function resolutionsNivel(intent){
  if(intent.slots.nivel.resolutions.resolutionsPerAuthority[0].status.code==='ER_SUCCESS_MATCH'){
    nivel=intent.slots.nivel.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    //let values=JSON.stringify(intent.slots.nivel.resolutions.resolutionsPerAuthority);
    //console.log('nivel: ',intent.slots.nivel.resolutions.resolutionsPerAuthority[0].values[0].value.name);
  }else{
    nivel=intent.slots.nivel.value.toUpperCase();
  }
}
/**
 * Funcion correlacionada con el intente Amazon.NoIntent
 */
function no() {
  const more =MORE_MESSAGE;
  const tempOutput = 'Ok, lo entiendo.'+PAUSE+' Puedes preguntarme "¿Quién se llevó las palmas?"'+PAUSE;
  +PAUSE+more;
  const speechOutput = tempOutput;
  return buildResponse(speechOutput, false, 'NO');
}
/**
 * Funcion correlacionada con el intent email
 */
function send() {
  const more =MORE_MESSAGE;
  const tempOutput = 'Ya envié el mensaje.'+PAUSE+' Revisa tu correo';
  +PAUSE+more;
  const speechOutput = tempOutput;
  return buildResponse(speechOutput, false, 'email');
}
/**
 * Funcion correlacionada con el default, si no encontro el intent solicitado
 */
function nose() {
  const tempOutput = '¡Vaya! Ahora si me metiste en aprietos, en realidad no sé qué contestar pero me '+
  'pondré en contacto con los creadores. '+WHISPER+ 'Puedes preguntarme como nos irá en el siguiente trimestre. '
  +CLOSE_WHISPER+ PAUSE;
  const speechOutput = tempOutput;
  const more = MORE_MESSAGE
  return buildResponseWithRepromt(speechOutput, false, 'WELCOME', more);
}
/**
 * Funcion que verifica que las respuestas y peticiones sean de Alexa
 * @param {} req 
 * @param {*} res 
 * @param {*} next 
 */
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
   * Funcion que genera una peticion al usuario para saber el pp de la consulta
   */
  function palmasSlotpp(){
    var jsonObj={
      "version": "1.0",
      "sessionAttributes": {},
      "response": {
        "outputSpeech": {
          "type": "PlainText",
          "text": "¿Puedes repetirme el programa presupuestal?"
        },
        "shouldEndSession": false,
        "directives": [
          {
            "type": "Dialog.ElicitSlot",
            "slotToElicit": "pp",
            "updatedIntent": {
              "name": "palmas",
              "confirmationStatus": "NONE",
              "slots": {
                "pp": {
                  "name": "pp",
                  "confirmationStatus": "NONE"
                },
                "nivel": {
                  "name": "nivel",
                  "confirmationStatus": "NONE"               
                 }
                }
              }
          }
        ]
      }
    }
    return jsonObj;
  }
   /**
   * Funcion que genera una peticion al usuario para saber el nivel de la consulta
   */
  function palmasSlotnivel(value){
    var jsonObj={
      "version": "1.0",
      "sessionAttributes": {},
      "response": {
        "outputSpeech": {
          "type": "PlainText",
          "text": "¿Cuál es el nivel?"
        },
        "shouldEndSession": false,
        "directives": [
          {
            "type": "Dialog.ElicitSlot",
            "slotToElicit": "nivel",
            "updatedIntent": {
              "name": "palmas",
              "confirmationStatus": "NONE",
              "slots": {
                "pp": {
                  "name": "pp",
                  "confirmationStatus": "NONE"
                },
                "nivel": {
                  "name": "nivel",
                  "confirmationStatus": "NONE"               
                 }
                }
            }
          }
        ]
      }
    }
    return jsonObj;
  }
/**
 * Funcion que genera un query para saber el avance del mes actual
 * @param {select} peticion la peticion del usuario(el dato a seleccionar)
 * @param {select} anno año del dato a solicitar
 * @param {select} pp programa presupuestal
 * @param {select} nivel nivel (F1,F2,etc)
 * @param {select} mes mes que se quiere saber.
 */
async function select(peticion,anno,pp,nivel,mes,conjugacion){
    let string= "SELECT "+peticion+" FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes_num= "+mes+" and nivel= '"+nivel+"';";
    let respuesta= await con.qry(string);
//console.log(string);
    
    if(respuesta != null){
      speechOutput= 'En el '+pp+' en el '+nivel+' '+PAUSE+ ''+conjugacion+' '+respuesta+' '+ MORE_MESSAGE;
    }else{
      speechOutput='Lo siento, no pude encontrar los datos que solicitaste, '+WHISPER+ 'revisa que tu consulta sea correcta.'+ CLOSE_WHISPER;
    }
    //console.log(speechOutput);
    const reprompt = HELP_REPROMPT
    var jsonObj= buildResponseWithRepromt(speechOutput, false, "SELECT", reprompt);
   return await jsonObj;
  }
/**
 * Funcion que genera un query para detallar el avance de un mes o trimestre solicitado
 * @param {selectAll} anno 
 * @param {selectAll} pp 
 * @param {selectAll} nivel 
 * @param {selectAll} mes 
 */
async function selectAll(anno,pp,nivel,mes,conjugacion){
    let string= "SELECT * FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes_num= "+mes+" and nivel= '"+nivel+"';";
    let respuesta= await con.qryAll(string);
    
    if(respuesta != null){
      speechOutput= 'En el '+pp+' en el '+nivel+' '+PAUSE+ ''+conjugacion+' '+respuesta[2]+ ' unidades, acumulando un total de '+ respuesta[1]+'. Lo programado fueron '
        + respuesta[0]+ ' unidades '+PAUSE;
        if(respuesta[3]>0){
          speechOutput+='asi que restan por hacer '+respuesta[3]+'.'+PAUSE; 
        }else{
          speechOutput+='asi que hemos hecho '+Math.abs(respuesta[3])+' de más.'+PAUSE; 
        }
    }else{
      speechOutput='Lo siento, no pude encontrar los datos que solicitaste, '+WHISPER+ 'revisa que tu consulta sea correcta.'+ CLOSE_WHISPER;
    }
    const reprompt = HELP_REPROMPT
    var jsonObj= buildResponseWithRepromt(speechOutput, false, "SELECT", reprompt);
    return await jsonObj;
  }
  /**
   * Funcion que hace un query para hacer el análisis en retrospectiva de las unidades con mayor porcentaje en el mes
   * o trimestre dado
   * @param {*} anno 
   * @param {*} pp 
   * @param {*} nivel 
   * @param {*} mes 
   * @param {*} conjugacion 
   */
  async function selectPalmas(anno,pp,nivel,mes,conjugacion){
    let string= "SELECT DISTINCT(acumulado),u_admi FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes_num= "+mes+" and nivel= '"+nivel+"' and u_admi != 'TOTAL' ORDER BY acumulado DESC;";
    let respuesta= await con.qryPalmas(string);
    
    if(respuesta != null){
      switch (respuesta.length){
        case 1:
          speechOutput= 'En el '+pp+' en el '+nivel+' '+PAUSE+''+conjugacion+' la '+respuesta[0].ua+ ' con '+respuesta[0].acumulado+' unidades.'+PAUSE;
          break;
          case 2:
          speechOutput= 'En el '+pp+' en el '+nivel+' '+PAUSE+''+conjugacion+' la '+respuesta[0].ua+ ' con '+respuesta[0].acumulado+' unidades, seguido de '+ respuesta[1].ua+' con '
          + respuesta[1].acumulado+ ' unidades.'+PAUSE; 
          break; 
        case 3:
          speechOutput= 'En el '+pp+' en el '+nivel+' '+PAUSE+''+conjugacion+' la '+respuesta[0].ua+ ' con '+respuesta[0].acumulado+' unidades, seguido de '+ respuesta[1].ua+' con '
          + respuesta[1].acumulado+ ' unidades. '+PAUSE+'Y en tercer lugar está '+respuesta[2].ua+' con '+respuesta[2].acumulado+' unidades.'+PAUSE;
          break;   
        }
    }else{
      speechOutput='Lo siento, no pude encontrar los datos que solicitaste, '+WHISPER+ 'revisa que tu consulta sea correcta.'+ CLOSE_WHISPER;
    }
    const reprompt = HELP_REPROMPT
    var jsonObj= buildResponseWithRepromt(speechOutput, false, "SELECT", reprompt);
   return await jsonObj;
  }
  /**
   * Funcion que genera la estadistica para predecir el mes siguiente de acuerdo al mes dado
   * @param {} anno 
   * @param {*} pp 
   * @param {*} nivel 
   * @param {*} mes 
   */
  async function selectPre(anno,pp,nivel,mes){
    let string= "SELECT * FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes_num<= "+mes+" and nivel= '"+nivel+"' and u_admi='TOTAL';";
    let respuesta= await con.qryPre(string);
    
    if(respuesta != null){
        if(mes==1){
          speechOutput= pre.decima(respuesta,pp,nivel);
        }else if(mes>1 && mes<12){
          speechOutput= pre.regrecionLineal(respuesta,pp,nivel);
        }else{
          speechOutput='Creo que esa predicción va por tu cuenta.';
        }
    }else{
      speechOutput='Lo siento, no pude encontrar los datos que solicitaste, '+WHISPER+ 'revisa que tu consulta sea correcta.'+ CLOSE_WHISPER;
    }
    const reprompt = HELP_REPROMPT
    var jsonObj= buildResponseWithRepromt(speechOutput, false, "SELECT", reprompt);
    return await jsonObj;
  }
/**
 * Funcion que limpia el seechOutput, quitandole los string PAUSE, WHISPER y CLOSE_WHIPER
 */
function clean(){
  let string1=speechOutput;
  let string2;
  while(string1.search(PAUSE)!=-1){
   string2=string1.replace(PAUSE,'');
   string1=string2;
  }
  while(string1.search(WHISPER)!=-1){
    string2=string1.replace(WHISPER,'');
    string1=string2;
   }
   while(string1.search(CLOSE_WHISPER)!=-1){
    string2=string1.replace(CLOSE_WHISPER,'');
    string1=string2;
   }
  return string1;
}
/**
 * Se enciende el servidor http:8180, https:443
 */
app.listen(8180);
https.createServer(httpsOptions,app).listen(port,function(){
	console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);	
})
console.log('Alexa list RESTful API server started on: ' + port);
