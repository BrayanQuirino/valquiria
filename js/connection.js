let {Pool} = require('pg');
async function qry(string,peticion){
    //console.log(string);
    let pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'valquiria',
      password: 'postgres',
      port: 5432,
    })
    let respuesta;
    await pool.query(string, (err, res) => {
        if (err) {
           console.log(err.stack)
        }else{
           // console.log('Llegue aqui',res.rows[0][peticion]);
            respuesta= res.rows[0].porcentaje;
        }
        })
    await pool.end();
    //console.log(respuesta);
    return respuesta;
  }

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

  exports.qry=qry;
  exports.s=s;
