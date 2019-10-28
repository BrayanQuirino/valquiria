let express = require('express'),
  bodyParser = require('body-parser'),
  port = 443,
  app = express();
let alexaVerifier = require('alexa-verifier');
var isFisrtTime = true;
const fs=require('fs');
const path=require('path');
const https=require('https');
const Speech = require ('ssml-builder');
const directoryToServe='client'
const SKILL_NAME = 'BD';
let WELCOME_MESSAGE='Bienvenido al baúl de BD. ';
//onst GET_HERO_MESSAGE = "Here's your hero: ";
const HELP_MESSAGE = 'Puedes intentar preguntarme ¿Que es una base de datos?';
const HELP_REPROMPT = '¿En que puedo ayudarte?';
const STOP_MESSAGE = 'Disfruta el día...¡adios!';
const MORE_MESSAGE = 'Preguntame algo';
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered">';
const CLOSE_WHISPERED = '</amazon:effect>';
const httpsOptions ={
	cert:fs.readFileSync("/home/BrayanQuirino/prueba/ssl/fullchain.pem"),
	key:fs.readFileSync("/home/BrayanQuirino/prueba/ssl/privkey.pem")
}
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

app.post('/valquiria', requestVerifier, function(req, res) {

  if (req.body.request.type === 'LaunchRequest') {
    res.json(welcome());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End")
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case 'BDIntent':
        res.json(whatIsBD());
        break;
      case 'SQLIntent':
        res.json(whatIsSQL());
        break;
      case 'RelacionalIntent':
        res.json(whatIsRelacional());
        break;
      case 'SMBDIntent':
          res.json(whatIsSMBD());
          break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      case 'AMAZON.StopIntent':
        res.json(stopAndExit());
        break;
      default:

    }
  }
});

function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null)
}

function stopAndExit() {

  const speechOutput = STOP_MESSAGE
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}

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
  const speechOutput = tempOutput + MORE_MESSAGE
  const more = MORE_MESSAGE
  return buildResponseWithRepromt(speechOutput, false, 'WELCOME', more);

}
function whatIsBD() {

  if (!isFisrtTime) {
    WELCOME_MESSAGE = '';
  }
  const tempOutput = WHISPER+'Una base de datos es un “almacén”'+PAUSE+
  'que nos permite guardar grandes cantidades de información '+PAUSE+
  'de forma organizada para que luego podamos encontrar y utilizar fácilmente.'+CLOSE_WHISPERED;
  const speechOutput = tempOutput;
  const more = MORE_MESSAGE
  return buildResponseWithRepromt(speechOutput, false, 'BD', more);

}
function whatIsSQL() {

  if (!isFisrtTime) {
    WELCOME_MESSAGE = '';
  }
  const tempOutput ='SQL (Structured Query Language)'+PAUSE+
  'es un lenguaje de programación estándar e interactivo '+PAUSE+
  'para la obtención de información desde una base de datos y para actualizarla. '
  + PAUSE;
  const speechOutput = tempOutput;
  const more = MORE_MESSAGE
  return buildResponseWithRepromt(speechOutput, false, 'SQL', more);

} 
function whatIsSMBD() {

  if (!isFisrtTime) {
    WELCOME_MESSAGE= '';
  }
  const tempOutput ='Es una colección de software muy específico,' 
  +'cuya función es servir de interfaz entre la base de datos, el usuario y'+
  'las distintas aplicaciones utilizadas. '+PAUSE;
  + PAUSE;
  const speechOutput = tempOutput;
  const more = MORE_MESSAGE
  return buildResponseWithRepromt(speechOutput, false, 'SMBD', more);

}
function whatIsRelacional() {

  if (!isFisrtTime) {
   WELCOME_MESSAGE = '';
  }
  const tempOutput ='Modelo de organización y gestión de bases de datos'
  +PAUSE+' consistente en el almacenamiento de datos en tablas compuestas por filas, o tuplas,'+ 
  'y columnas o campos. Se distingue de otros modelos, como el jerárquico, por ser más comprensible'+
  ' para el usuario inexperto, y por basarse en la lógica de predicados para establecer relaciones entre distintos datos. '
  + PAUSE;
  const speechOutput =  tempOutput;
  const more = MORE_MESSAGE
  return buildResponseWithRepromt(speechOutput, false, 'Relacional', more);

}  
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

app.listen(8080);
https.createServer(httpsOptions,app).listen(port,function(){
	console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);	
})
console.log('Alexa list RESTful API server started on: ' + port);
