import {NextRequest,NextResponse} from 'next/server';import {deleteKey,setKeyStatus} from '@/lib/keys';
export const runtime='nodejs';
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;const b=await req.json();if(!['active','disabled'].includes(b.status))return NextResponse.json({error:'حالة غير صالحة.'},{status:400});await setKeyStatus(id,b.status);return NextResponse.json({ok:true});}
export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;await deleteKey(id);return NextResponse.json({ok:true});}
