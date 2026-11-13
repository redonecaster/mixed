import {NextRequest,NextResponse} from 'next/server';import {addKey,listKeys} from '@/lib/keys';
export const runtime='nodejs';
export async function GET(){try{return NextResponse.json(await listKeys());}catch{return NextResponse.json({error:'تعذر الاتصال بقاعدة البيانات.'},{status:503});}}
export async function POST(req:NextRequest){try{const b=await req.json();if(!['kie','cometapi'].includes(b.provider)||typeof b.api_key!=='string'||!b.api_key.trim())return NextResponse.json({error:'بيانات المفتاح غير مكتملة.'},{status:400});const id=await addKey(b.provider,b.api_key.trim(),String(b.label??''));return NextResponse.json({id},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'تعذر إضافة المفتاح.'},{status:400});}}
