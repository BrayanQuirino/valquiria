const {Pool} = require('pg');
let pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'valquiria',
    password: 'postgres',
    port: 5432,
  })
async function qry(string,peticion){
    //console.log(string);
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

  exports.qry=qry;

