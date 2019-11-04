const {Pool} = require('pg');
let pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'valquiria',
    password: 'postgres',
    port: 5432,
  })
 async function qry(string){
    console.log(string);
    let respuesta;
    await pool.query(string, async (err, res) => {
        if (err) {
           console.log(err.stack)
        }else{
            await console.log('Llegue aqui',res.rows[0].acumulado);
            respuesta=await res.rows[0].acumulado;
        }
        })
    pool.end();
    console.log(respuesta);
    return respuesta;
  }

  exports.qry=qry;

