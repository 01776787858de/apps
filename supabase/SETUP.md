# إعداد روابط التنزيل لمرة واحدة

هذه الإضافة تحتاج مشروع Supabase؛ ملفات GitHub Pages وحدها لا تستطيع منع إعادة استخدام الرابط.

## 1) إعداد قاعدة البيانات
افتح SQL Editor في مشروع Supabase ونفّذ محتوى:
`migrations/202611100001_single_use_download_links.sql`

## 2) إعداد Edge Functions
من مجلد المشروع، ثبّت Supabase CLI وسجّل الدخول ثم اربط المشروع:
```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ADMIN_API_KEY="ضع-مفتاحاً-طويلاً-وعشوائياً"
supabase functions deploy create-download-link
supabase functions deploy redeem-download-link
```
اترك `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` ضمن أسرار بيئة Supabase الافتراضية، ولا تضع service role key في صفحة الويب مطلقاً.

## 3) إعداد صفحة التنزيل
في `download.html` استبدل:
- `SUPABASE_URL` برابط مشروعك.
- `SUPABASE_ANON_KEY` بمفتاح anon/public فقط.

وأدخل رابط المشروع ومفتاح anon/public ومفتاح الإدارة نفسه في قسم اللوحة.

## 4) الحصول على كود Downloader الرسمي
من زر الرابط لمرة واحدة انسخ الرابط الناتج، ثم افتح AFTVnews Downloader وأضف الرابط هناك لتحصل على كود Downloader الرسمي. خدمة AFTVnews هي التي تصدر الكود الرقمي؛ لوحة apps لا تستطيع إصدار أكوادها نيابة عنها.

## ملاحظة مهمة
يُستهلك الرابط عند أول طلب تحقق ناجح، قبل تحويل المستخدم إلى ملف APK. لا يمكن للمتصفح معرفة أن الملف اكتمل تنزيله فعلياً، لذلك إذا انقطع الاتصال بعد استهلاك الرابط فستحتاج لإنشاء رابط جديد. هذا يمنع إعادة استخدام رابط التفعيل، لكنه لا يمنع مشاركة ملف APK بعد تنزيله.
