# Media Generator MCP

## Environment
انسخ `.env.example` إلى `.env.local` وضع بيانات اعتماد جديدة. المتغيرات الإلزامية: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `MERGER_API_BASE`. أضف مفاتيح Kie/CometAPI من الواجهة بعد التحقق من الموصلات.

## Run
`npm install && npm run dev` ثم افتح `http://localhost:3000` وMCP على `/mcp`.

## Deploy
أنشئ مشروع Vercel وحدد Root Directory=`apps/media-mcp`، ثم أضف المتغيرات أعلاه. لا تنشر قبل استكمال موصل CometAPI واختبار مزود Kie الفعلي.

## Known integration boundary
موصل Kie للمهام غير المتزامنة مهيأ. لم تُخترع نقاط نهاية CometAPI أو الصور المتزامنة دون اختبار عقدها الفعلي؛ يلزم استكمالها والتحقق من نمط الاستجابة الفعلي قبل الإنتاج. كذلك يحتاج الدمج إلى ربط adapter بمهمة Turso في مسار `merge_videos`.
