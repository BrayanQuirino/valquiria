let express = require('express'),
  bodyParser = require('body-parser'),
  port = 443,
  app = express();
let alexaVerifier = require('alexa-verifier');
let atributos;
var isFisrtTime = true;
const fs=require('fs');
const path=require('path');
const https=require('https');
const Speech = require ('ssml-builder');
const directoryToServe='client'
const SKILL_NAME = 'valquiria';
let WELCOME_MESSAGE='Bienvenido al baúl de BD. ';
const HELP_MESSAGE = 'Puedes decir ayuda, o, salir... ¿Qué quieres hacer?';
const HELP_REPROMPT = '¿En qué puedo ayudarte?';
const MORE_MESSAGE = 'Preguntame algo';
const STOP_MESSAGE = 'Disfruta el día...adios!';
const con=require('./connection');
const PAUSE = '<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered">';
const CLOSE_WHISPER ='</amazon:effect>';
const httpsOptions ={
	cert:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/fullchain.pem"),
	key:fs.readFileSync("/etc/letsencrypt/live/cndiserv.cultura.gob.mx/privkey.pem")
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
app.post('/valquiria', requestVerifier, function(req, res) {

  if (req.body.request.type === 'LaunchRequest') {
    res.json(welcome());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End")
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case 'AMAZON.YesIntent':
        res.json();
        break;
      case 'AMAZON.NoIntent':
        res.json();
        break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      case 'principal':
        let mes= req.body.request.intent.slots.mes.value;
        let nivel=req.body.request.intent.slots.nivel.value.toUpperCase();
        let pp=req.body.request.intent.slots.pp.value.toUpperCase();
        console.log(mes,nivel,pp);
        res.json(select('2019',pp,nivel,mes));
        break; 
      default:

    }
  }
});
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

  function select(anno,pp,nivel,mes){
    let string= "SELECT acumulado FROM mir WHERE anno = '"+anno+"' and programa = '"+pp+"' and mes= '"+mes+"' and nivel= '"+nivel+"';";
    return 'Vas...'+con.qry(string);
  }


app.listen(8180);
https.createServer(httpsOptions,app).listen(port,function(){
	console.log(`Serving the ${directoryToServe} directory at https:vmonet:${port}`);	
})
console.log('Alexa list RESTful API server started on: ' + port);
