const {createClient}=require('@libsql/client');
const db=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
let ready;
async function schema(){if(!ready)ready=db.batch([
`CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,status TEXT NOT NULL,progress INTEGER DEFAULT 0,sources_json TEXT NOT NULL,output_size INTEGER,output_duration REAL,output_resolution TEXT,error TEXT,created_at TEXT DEFAULT(datetime('now')),expires_at TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS sources(job_id TEXT NOT NULL,seq INTEGER NOT NULL,kind TEXT NOT NULL,url TEXT,name TEXT,size INTEGER,mime TEXT,PRIMARY KEY(job_id,seq))`,
`CREATE TABLE IF NOT EXISTS source_chunks(job_id TEXT NOT NULL,seq INTEGER NOT NULL,chunk INTEGER NOT NULL,data BLOB NOT NULL,PRIMARY KEY(job_id,seq,chunk))`,
`CREATE TABLE IF NOT EXISTS output_chunks(job_id TEXT NOT NULL,chunk INTEGER NOT NULL,data BLOB NOT NULL,PRIMARY KEY(job_id,chunk))`
],'write').then(()=>{});return ready;}
async function cleanup(){await schema();await db.execute(`DELETE FROM source_chunks WHERE job_id IN (SELECT id FROM jobs WHERE expires_at<datetime('now'))`);await db.execute(`DELETE FROM output_chunks WHERE job_id IN (SELECT id FROM jobs WHERE expires_at<datetime('now'))`);await db.execute(`DELETE FROM sources WHERE job_id IN (SELECT id FROM jobs WHERE expires_at<datetime('now'))`);await db.execute(`DELETE FROM jobs WHERE expires_at<datetime('now')`);}
module.exports={db,schema,cleanup};
