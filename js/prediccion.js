/*Programa realizado por Brayan Quirino
16 de enero de 2020
*/
/**
 * @param PAUSE constante que da una pausa a Alexa al momento de hablar
 * @param WHISPER constante que abre los corchetes de susurro
 * @param CLOSE_WHISPER constante que cierra los corchetes de susurro
 * Todas estas constantes son usadas para formar una respuesta de Alexa
 */
const PAUSE='<break time="0.3s" />';
const WHISPER = '<amazon:effect name="whispered">';
const CLOSE_WHISPER ='</amazon:effect>';
/**
 * Esta funcion solo se usa para el mes uno (enero). Con base a los datos esta funcion "predice" febrero
 * aumentando una decima de lo progrmado en enero y aumentando una octava de lo acumulado.
 * @param {*} respuesta Array de datos que continen, lo programado y acumulado del mes uno.
 * @param {*} pp Programa presupuestal
 * @param {*} nivel nivel
 */
  function decima(respuesta,pp,nivel){
    let speechOutput;
    var decima=Math.ceil((respuesta[0].programado/10)+respuesta[0].programado);
    var octava=Math.ceil((respuesta[0].acumulado/8)+respuesta[0].acumulado);
    speechOutput= 'En el '+pp+' en el '+nivel+'.'+PAUSE+' De acuerdo con los datos, ustedes han programado '+respuesta[0].programado
    +' unidades, realizando '+respuesta[0].acumulado+''+PAUSE+' Entonces creo que deberías programar en el siguiente mes '
    +decima+' unidades. Si trabajan bien,'+PAUSE+' podrían realizar '+octava+'';
    //console.log('en decima',respuesta[0]);
    return speechOutput;
  }
  /**
   * Esta funcion realiza una suavizacion exponencial triple con base en la funcion 
   * PRONOSTICO.ETS de Excel. Básicamente se genera una prevision del mes siguiente dado los datos de 
   * los meses anteriores en el array respuesta
   * @param {*} respuesta Array de datos que continen, lo programado y acumulado de los meses anteriores según la consulta.
   * @param {*} pp Programa presupuestal
   * @param {*} nivel nivel
   */
  function regrecionLineal(respuesta,pp,nivel){
    let speechOutput;
    //Para simplificar el codigo se usaron dos for para matriz y matriz2
    //Se cálculan los datos para generar la previsión
    let matriz=[];
    let matriz2=[];
    let alfa=0.98;
    let betta=0.1;
    let gama=0.1;
    for(i=0;i<respuesta.length;i++){
        let json={};
        if(i==0){
            json.x=i+1;
            json.y=respuesta[i].acumulado
            json.at=json.y;
            json.tt=0;
            json.st=1;
            json.pronostico=0;
        }else{
            json.x=i+1;
            json.y=respuesta[i].acumulado
            json.at=alfa*(json.y/matriz[i-1].st)+(1-alfa)*(matriz[i-1].at+matriz[i-1].tt);
            json.tt=betta*(json.at-matriz[i-1].at)+(1+betta)*matriz[i-1].tt;
            json.st=gama*(json.y/json.at)+(1-gama)*matriz[i-1].st;
            json.pronostico=(matriz[i-1].at+1*matriz[i-1].tt)*matriz[i-1].st;
            if(i==1){
                json.pronostico*=2;
            }
            json.pronostico=Math.ceil(json.pronostico);
        }
        matriz.push(json);
        //console.log('matrz1',matriz[i]);
    }
    for(i=0;i<respuesta.length;i++){
        let json={};
        if(i==0){
            json.x=i+1;
            json.y=respuesta[i].programado
            json.at=json.y;
            json.tt=0;
            json.st=1;
            json.pronostico=0;
        }else{
            json.x=i+1;
            json.y=respuesta[i].programado
            json.at=alfa*(json.y/matriz2[i-1].st)+(1-alfa)*(matriz2[i-1].at+matriz2[i-1].tt);
            json.tt=betta*(json.at-matriz2[i-1].at)+(1+betta)*matriz2[i-1].tt;
            json.st=gama*(json.y/json.at)+(1-gama)*matriz2[i-1].st;
            json.pronostico=(matriz2[i-1].at+1*matriz2[i-1].tt)*matriz2[i-1].st;
            if(i==1){
                json.pronostico*=2;
            }
            json.pronostico=Math.ceil(json.pronostico);
        }
        //console.log(json)
        matriz2.push(json);
    }
    //Dependiendo del resultado (porcentaje) se genera un respuesta distinta.
    let porcentaje=(matriz[respuesta.length-1].pronostico/matriz2[respuesta.length-1].pronostico*100).toFixed(2);
    speechOutput= 'En el '+pp+' en el '+nivel+'.'+PAUSE+' De acuerdo con los datos, se programarán '+matriz2[respuesta.length-1].pronostico+' unidades aproximadamente'
    +PAUSE+' de las cuales quizá se realicen '+matriz[respuesta.length-1].pronostico+''+PAUSE+' lo que nos dejaría con el '
    +porcentaje+'%'+PAUSE+' Entonces creo que ';
    if(porcentaje<=50){
        speechOutput+= WHISPER+'vamos algo mal, deberían bajar las metas un poco.'+CLOSE_WHISPER;
    }else if(porcentaje>50 && porcentaje<=60){
        speechOutput+='deberían bajar las metas pues apenas se está trabajando a la mitad'
    }else if(porcentaje>60 && porcentaje<=80){
        speechOutput+='no vamos tan mal.'
    }else if(porcentaje>80 && porcentaje<=95){
        speechOutput+='vamos mejor de lo que creía'
    }else if(porcentaje>95){
        speechOutput+='vamos muy bien, ¡Felicidades!'
    }
    return speechOutput;
  }
 
  exports.decima=decima;
  exports.regrecionLineal=regrecionLineal;
