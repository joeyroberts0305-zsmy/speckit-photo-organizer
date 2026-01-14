import initSqlJs from 'sql.js';

async function run(){
  const SQL = await initSqlJs({ locateFile: file => `./node_modules/sql.js/dist/${file}` });
  const db = new SQL.Database();
  try{
    db.run('CREATE TABLE test (a INTEGER);');
    db.run('INSERT INTO test (a) VALUES (42);');
    const res = db.exec('SELECT a FROM test;');
    const val = res[0].values[0][0];
    if(val !== 42) throw new Error('unexpected value');
    console.log('smoke: OK');
    process.exit(0);
  }catch(err){
    console.error('smoke: failed', err);
    process.exit(1);
  }finally{
    db.close();
  }
}

run();
