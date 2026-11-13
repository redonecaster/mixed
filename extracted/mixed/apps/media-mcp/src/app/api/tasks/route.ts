import {NextRequest,NextResponse} from 'next/server';import {listRecentTasks,taskStats} from '@/lib/turso';
export const runtime='nodejs';
export async function GET(req:NextRequest){const q=req.nextUrl.searchParams;const [tasks,stats]=await Promise.all([listRecentTasks(Number(q.get('limit')??20),{type:q.get('type')??undefined,status:q.get('status')??undefined}),taskStats()]);return NextResponse.json({tasks,stats});}
