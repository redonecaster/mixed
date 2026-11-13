# Video Merger (Vercel Functions)

## التشغيل
1. `cp .env.example .env` ثم ضع بيانات Turso جديدة.
2. `npm install`
3. `npm run dev` ثم افتح `http://localhost:3000`.

## Vercel
أنشئ مشروعًا مستقلًا وحدد Root Directory=`apps/video-merger`. أضف `TURSO_DATABASE_URL` و`TURSO_AUTH_TOKEN`، ويمكنك ضبط حدود الأحجام و`FFMPEG_PRESET`. انشر الواجهة وواجهات API من نفس المشروع.

## API
- `POST /api/jobs` ينشئ مهمة من `videos` أو `sources`.
- `POST /api/upload?job=<id>&seq=<n>&chunk=<k>` يرفع جزءًا ثنائيًا حتى 4MB.
- `POST /api/jobs/<id>/process` ينفذ FFmpeg.
- `GET /api/jobs/<id>` الحالة.
- `GET /api/jobs/<id>/video` يدعم Range.
- `DELETE /api/jobs/<id>` حذف.
- `GET /api/config` حدود الخدمة.
- `GET /api/cron` تنظيف المنتهي.

## حدود/ملاحظات
تخزين Turso BLOB عبر صفوف 2MB، ومخرجات MP4 مخزنة في Turso. الدوال الطويلة تحتاج خطة Vercel تسمح بحد أقصى 300 ثانية. FFmpeg وعمليات التنزيل قد تتجاوز حدود الموارد في خطط Serverless الصغيرة؛ اختبر على الخطة الفعلية. هذه النسخة الأولية لا تضمن بعد كل معايير الإنتاج المتقدمة (التحقق الشامل من SSRF وstreaming progress الحقيقي وإعادة استئناف الدمج عند انقطاع الدالة)، لذلك لا تعتبرها جاهزة لبيانات حساسة أو تشغيل عام قبل إكمال اختبارات التحميل والأمان.
