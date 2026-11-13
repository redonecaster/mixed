import {randomUUID} from 'node:crypto';
import {insertTask,updateTask,getTask} from './turso';
import {getKeyPool,recordKeyUse} from './keys';
import {resolveModel,ProviderId} from './models';
import {createKieTask,checkKieTask,ProviderError} from './providers/kie';

export function classifyProviderError(e:unknown){const status=e instanceof ProviderError?e.status:503;const msg=(e instanceof Error?e.message:String(e)).toLowerCase();if([401,403].includes(status)||/invalid api key|unauthorized|forbidden|authentication/.test(msg))return 'disabled';if(status===402||/insufficient|quota|balance|credit|out of credits|exhausted|充值/.test(msg))return 'exhausted';if(/model not found|unsupported model/.test(msg)&&[400,404,422].includes(status))return 'provider';if([400,422].includes(status))return 'params';return 'temporary';}
async function start(taskId:string,modelName:string,input:Record<string,unknown>,type:'image'|'video'){
 const model=resolveModel(modelName);if(!model||model.type!==type)throw new Error('اسم الموديل غير معروف أو لا يطابق نوع المهمة.');
 const keys=await getKeyPool(model.providers);if(!keys.length)throw new Error('no_keys: لا توجد مفاتيح نشطة لهذه الخدمة.');
 const attempts:unknown[]=[];
 for(const k of keys){const keyId=String(k.id),provider=String(k.provider) as ProviderId;try{
   const providerModel=model.providerModel[provider];
   // دعم Kie متاح مباشرة؛ يُترك موصل CometAPI معزولًا لتحديثه حسب عقد API المؤكد.
   if(provider!=='kie')throw new ProviderError(501,'CometAPI adapter requires verified endpoint configuration');
   const providerTaskId=await createKieTask(String(k.api_key),providerModel,input);
   await recordKeyUse(keyId,true);attempts.push({provider,keyId,keyLabel:k.label,ok:true,at:new Date().toISOString()});
   await updateTask(taskId,{provider,provider_task_id:providerTaskId,key_id:keyId,attempts_json:JSON.stringify(attempts),status:'processing'});
   return;
  }catch(e){const cls=classifyProviderError(e);const msg=e instanceof Error?e.message:'Unknown error';attempts.push({provider,keyId,keyLabel:k.label,ok:false,errorClass:cls,error:msg,at:new Date().toISOString()});await recordKeyUse(keyId,false,msg);if(cls==='disabled')await (await import('./turso')).db.execute({sql:"UPDATE api_keys SET status='disabled' WHERE id=?",args:[keyId]});if(cls==='exhausted')await (await import('./turso')).db.execute({sql:"UPDATE api_keys SET status='exhausted' WHERE id=?",args:[keyId]});await updateTask(taskId,{attempts_json:JSON.stringify(attempts)});if(cls==='params')throw new Error('معطيات الطلب غير صالحة.');}
 }
 // إبقاء المهمة processing؛ ستعاد المحاولة في get_task بعد فترة التهدئة.
 await updateTask(taskId,{status:'processing',error_message:'بانتظار توفر مفتاح صالح…',attempts_json:JSON.stringify(attempts)});
}
export async function runGeneration(type:'image'|'video',args:Record<string,unknown>){const id=randomUUID(),model=String(args.model??(type==='image'?'gpt-image-2-6/flare-text-to-image':'grok-imagine-video-1-5-preview'));await insertTask({id,model,type,prompt:String(args.prompt??''),params:args});await start(id,model,{...args},type);return {task_id:id,status:'processing',message:`⏳ المهمة قيد المعالجة — task_id: ${id}`};}
export async function refreshTask(id:string){const t=await getTask(id);if(!t)throw new Error('المهمة غير موجودة.');if(t.status==='completed'||t.status==='failed')return t;
 if(!t.provider_task_id){const last=Date.parse(String(t.updated_at??''));if(!last||Date.now()-last>45_000){const p=JSON.parse(String(t.params_json??'{}'));await start(id,String(t.model),p,String(t.type) as 'image'|'video');}return await getTask(id);}
 if(t.provider==='kie'&&t.key_id){const {db}=await import('./turso');const k=await db.execute({sql:'SELECT api_key FROM api_keys WHERE id=?',args:[t.key_id]});if(!k.rows[0])return t;try{const r=await checkKieTask(String(k.rows[0].api_key),String(t.provider_task_id));if(r.status==='completed')await updateTask(id,{status:'completed',progress:100,result_urls_json:JSON.stringify(r.urls),error_message:null});else if(r.status==='failed'){const p=JSON.parse(String(t.params_json??'{}'));await updateTask(id,{provider_task_id:null,key_id:null,error_message:r.error??'Provider task failed'});await start(id,String(t.model),p,String(t.type) as 'image'|'video');}else await updateTask(id,{progress:r.progress??Number(t.progress??0)});}catch{/* أخطاء الشبكة مؤقتة؛ تبقى المهمة قابلة للاستعلام */}}
 return await getTask(id);
}
