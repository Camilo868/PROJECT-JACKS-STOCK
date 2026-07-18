import pg from 'pg';

export const pool = new pg.Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    port:process.env.DB_PORT
})

// export const pool_2 = new pg.Pool({
//     user: DB_USER,
//     host: DB_HOST,
//     password: DB_PASSWORD,
//     database: DB_DATABASE,
//     port: DB_PORT
// })
