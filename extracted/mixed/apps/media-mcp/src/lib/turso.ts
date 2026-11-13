import { createClient } from '@libsql/client';

// عميل واحد عبر HTTP؛ لا نعتمد على ملفات SQLite محلية في بيئة Vercel.
export const db = createClient({url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN!});
let schemaReady: Promise<void> | undefined;
export function ensureSchema() {
  schemaReady ??= (async () => {
    await db.batch([
      `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, provider TEXT, provider_task_id TEXT, key_id TEXT, model TEXT NOT NULL, type TEXT NOT NULL, prompt TEXT DEFAULT '', params_json TEXT DEFAULT '{}', status TEXT NOT NULL, progress INTEGER DEFAULT 0, result_urls_json TEXT, error_message TEXT, attempts_json TEXT DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), completed_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, provider TEXT NOT NULL, label TEXT DEFAULT '', api_key TEXT NOT NULL, status TEXT DEFAULT 'active', usage_count INTEGER DEFAULT 0, success_count INTEGER DEFAULT 0, fail_count INTEGER DEFAULT 0, last_used_at TEXT, last_checked_at TEXT, last_error TEXT, created_at TEXT DEFAULT (datetime('now')))`
    ], 'write');
  })();
  return schemaReady;
}
export async function dbHealthy(){ await ensureSchema(); await db.execute('SELECT 1'); return true; }
export type TaskType='image'|'video'|'merge';
export async function insertTask(t:{id:string;model:string;type:TaskType;prompt?:string;params?:unknown;provider?:string}) {
  await ensureSchema();
  await db.execute({sql:`INSERT INTO tasks(id,provider,model,type,prompt,params_json,status,progress) VALUES(?,?,?,?,?,?,?,0)`,args:[t.id,t.provider??null,t.model,t.type,t.prompt??'',JSON.stringify(t.params??{}),'processing']});
}
export async function getTask(id:string){await ensureSchema();const r=await db.execute({sql:'SELECT * FROM tasks WHERE id=?',args:[id]});return r.rows[0]??null;}
export async function updateTask(id:string,p:Record<string,unknown>){
  await ensureSchema(); const allowed=['provider','provider_task_id','key_id','status','progress','result_urls_json','error_message','attempts_json'];
  const sets:string[]=[];const args:unknown[]=[];
  for(const k of allowed) if(k in p){sets.push(`${k}=?`);args.push(p[k]);}
  sets.push("updated_at=datetime('now')"); if(p.status==='completed')sets.push("completed_at=datetime('now')");
  args.push(id); if(sets.length)await db.execute({sql:`UPDATE tasks SET ${sets.join(',')} WHERE id=?`,args:args as never[]});
}
export async function listRecentTasks(limit=20,filters:{type?:string;status?:string}={}){await ensureSchema();const w:string[]=[];const a:unknown[]=[];for(const k of ['type','status'] as const)if(filters[k]){w.push(`${k}=?`);a.push(filters[k]);}a.push(Math.min(50,Math.max(1,limit)));return (await db.execute({sql:`SELECT * FROM tasks ${w.length?'WHERE '+w.join(' AND '):''} ORDER BY created_at DESC LIMIT ?`,args:a as never[]})).rows;}
export async function taskStats(){await ensureSchema();const r=await db.execute(`SELECT COUNT(*) total,SUM(status='completed') completed,SUM(status='failed') failed,SUM(status='processing') processing FROM tasks`);return r.rows[0];}
