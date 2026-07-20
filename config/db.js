import pg from 'pg';

export const pool = new pg.Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    
    ssl: {
        rejectUnauthorized: false
    }
})
pool.query("SELECT NOW()")
    .then(() => console.log("✅ Conectado a Supabase"))
    .catch(err => console.error(err));

// export const pool_2 = new pg.Pool({
//     user: DB_USER,
//     host: DB_HOST,
//     password: DB_PASSWORD,
//     database: DB_DATABASE,
//     port: DB_PORT
// })
