const {Pool} = require('pg');
let pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'valquiria',
    password: 'postgres',
    port: 5432,
  })
  function qry(string){
    console.log(string);
    pool.query(string, (err, res) => {
        if (err) {
            console.log(err.stack)
        }else{
            console.log('Llegue aqui',res.rows[0].acumulado);
            return JSON.stringify(res.rows[0]);
        }
        })
    pool.end();
  }

  exports.qry=qry;

