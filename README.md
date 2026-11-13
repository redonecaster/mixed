# Mixed Media Platform

مستودع موحّد لتطبيقين مستقلين على Vercel:

- `apps/media-mcp`: Next.js + MCP Streamable HTTP لتوليد الصور والفيديو وإدارة المهام والمفاتيح عبر Turso.
- `apps/video-merger`: API وواجهة ثابتة لدمج الفيديوهات باستخدام FFmpeg وتخزين Turso.

## تنبيه نشر
كل تطبيق يُنشر كمشروع Vercel مستقل مع Root Directory خاص به. لا تضع أي أسرار في Git. استخدم مفاتيح جديدة بعد إبطال أي مفاتيح سبق مشاركتها في محادثة أو مستودع.

## متطلبات
Node.js 20+، حساب Turso، حساب Vercel، ومفاتيح مزودي التوليد. يلزم توفير عنوان خدمة الدمج العامة في `MERGER_API_BASE` داخل تطبيق MCP.

## التشغيل
راجع `apps/media-mcp/README.md` و`apps/video-merger/README.md`. لم يتم تضمين أي قيم أسرار فعلية.
