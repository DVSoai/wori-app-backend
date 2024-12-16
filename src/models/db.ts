import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "2001",
  host: "localhost",
  port: 5432,
  database: "woridb",
});
export default pool;
