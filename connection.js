const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "psql_parqueDB",
  password: "Admin76995",
  port: 5432,
});
module.exports = pool;
