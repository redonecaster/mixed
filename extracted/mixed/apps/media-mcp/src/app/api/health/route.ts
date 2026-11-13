import {NextResponse} from 'next/server';
import {dbHealthy} from '@/lib/turso';
export const runtime='nodejs'; export const dynamic='force-dynamic';
export async function GET(){let database='unavailable';try{await dbHealthy();database='turso-connected';}catch{}let mergerHealthy=false;try{const c=new AbortController();const t=setTimeout(()=>c.abort(),4000);const r=await fetch(`${process.env.MERGER_API_BASE}/api/config`,{signal:c.signal,cache:'no-store'});mergerHealthy=r.ok;clearTimeout(t);}catch{}
return NextResponse.json({ok:database==='turso-connected',database,mcpEndpoint:'/mcp',models:[{canonical:'gpt-image-2-6/flare-text-to-image',type:'image',providers:['kie','cometapi']},{canonical:'grok-imagine-video-1-5-preview',type:'video',providers:['kie','cometapi']}],merger:{base:process.env.MERGER_API_BASE??null,healthy:mergerHealthy},authRequired:!!process.env.MCP_ACCESS_TOKEN},{status:200});}
