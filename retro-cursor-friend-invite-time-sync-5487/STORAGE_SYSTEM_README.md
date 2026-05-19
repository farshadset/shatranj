# سیستم ذخیره‌سازی یکپارچه RETRO Cafe

## بررسی کلی

این سیستم یک راه‌حل جامع و یکپارچه برای مدیریت تغییرات و ذخیره‌سازی داده‌ها در بخش مدیریت سایت ارائه می‌دهد. سیستم هم در مرورگر کار می‌کند و هم قابلیت تغییر به سرور را دارد.

## ویژگی‌های کلیدی

### 🔄 مدیریت تغییرات یکپارچه
- **تایید تغییرات**: ذخیره دائمی تغییرات
- **لغو تغییرات**: بازگشت به آخرین حالت ذخیره شده
- **ردیابی خودکار**: تشخیص خودکار تغییرات در تمام بخش‌ها

### 💾 گزینه‌های ذخیره‌سازی
- **مرورگر**: ذخیره در localStorage (پیش‌فرض)
- **سرور**: ذخیره در API سرور
- **ترکیبی**: سرور اول، مرورگر به عنوان پشتیبان

### 🛡️ پشتیبان‌گیری و بازیابی
- **دانلود پشتیبان**: فایل JSON قابل دانلود
- **بازیابی پشتیبان**: آپلود و بازیابی از فایل JSON
- **پاک کردن داده**: حذف کامل تمام داده‌ها

## نحوه استفاده

### 1. تنظیمات محیطی

فایل `.env.local` را در ریشه پروژه ایجاد کنید:

```bash
# نوع ذخیره‌سازی
NEXT_PUBLIC_STORAGE_TYPE=browser

# پیشوند ذخیره‌سازی
NEXT_PUBLIC_STORAGE_PREFIX=retro-cafe

# آدرس API سرور (برای حالت server یا hybrid)
NEXT_PUBLIC_API_ENDPOINT=https://your-api-domain.com

# فعال/غیرفعال کردن پشتیبان مرورگر
NEXT_PUBLIC_FALLBACK_TO_BROWSER=true
```

### 2. تغییر نوع ذخیره‌سازی

#### حالت مرورگر (پیش‌فرض)
```typescript
// در src/lib/storage-config.ts
const developmentConfig: StorageConfig = {
  type: 'browser',
  prefix: 'retro-cafe-dev',
  fallbackToBrowser: true
}
```

#### حالت سرور
```typescript
const productionConfig: StorageConfig = {
  type: 'server',
  prefix: 'retro-cafe-prod',
  serverEndpoint: 'https://your-api-domain.com',
  fallbackToBrowser: false
}
```

#### حالت ترکیبی
```typescript
const hybridConfig: StorageConfig = {
  type: 'hybrid',
  prefix: 'retro-cafe-hybrid',
  serverEndpoint: 'https://your-api-domain.com',
  fallbackToBrowser: true
}
```

### 3. استفاده در کامپوننت‌ها

#### استفاده از Hook
```typescript
import { useUnifiedStorage } from '@/hooks/useUnifiedStorage'

function MyComponent() {
  const {
    data,
    hasUnsavedChanges,
    saveChanges,
    cancelChanges,
    confirmChanges,
    storageStatus
  } = useUnifiedStorage(initialData, {
    autoSave: true,
    autoSaveDelay: 10000,
    storageType: 'browser'
  })

  // استفاده از توابع
  const handleSave = async () => {
    const result = await saveChanges()
    if (result.success) {
      console.log('تغییرات ذخیره شد')
    }
  }

  return (
    <div>
      {hasUnsavedChanges && (
        <div className="bg-amber-100 p-4 rounded">
          تغییرات ذخیره نشده
          <button onClick={handleSave}>ذخیره</button>
          <button onClick={cancelChanges}>لغو</button>
        </div>
      )}
    </div>
  )
}
```

#### استفاده مستقیم از سرویس
```typescript
import { storageService } from '@/lib/storage-service'

// ذخیره داده
const result = await storageService.saveData({
  menuItems: [...],
  categories: [...],
  navbarStyle: 'text-only',
  dessertsConfig: {...},
  selectedTemplate: 'default'
})

// بارگذاری داده
const data = await storageService.loadData()

// پاک کردن داده
await storageService.clearData()
```

## بخش‌های تحت پوشش

### ✅ منوی آیتم‌ها
- افزودن/حذف آیتم‌ها
- تغییر نام و توضیحات
- تغییر تصاویر
- تغییر قیمت‌ها

### ✅ دسته‌بندی‌ها
- افزودن/حذف دسته‌بندی
- تغییر نام و آیکون
- تغییر ترتیب

### ✅ تنظیمات نوبار
- تغییر سبک نمایش (متن، آیکون، ترکیبی)
- تنظیم فونت‌ها
- تنظیم رنگ‌ها

### ✅ بخش دسرها
- تغییر عنوان و توضیحات
- انتخاب آیکون
- فعال/غیرفعال کردن نمایش

### ✅ قالب‌های نمایش
- انتخاب قالب (پیش‌فرض، فشرده، مربعی)
- تنظیمات قالب

### ✅ تنظیمات تم
- رنگ‌ها
- فونت‌ها
- فاصله‌ها و سایه‌ها

## پیاده‌سازی سرور

برای استفاده از حالت سرور، API endpoints زیر را پیاده‌سازی کنید:

### POST /api/save-data
```typescript
// دریافت داده و ذخیره در دیتابیس
export async function POST(request: Request) {
  const data = await request.json()
  
  // ذخیره در دیتابیس
  await saveToDatabase(data)
  
  return Response.json({ 
    success: true, 
    data,
    timestamp: new Date().toISOString()
  })
}
```

### GET /api/load-data
```typescript
// بارگذاری داده از دیتابیس
export async function GET() {
  const data = await loadFromDatabase()
  
  return Response.json({ 
    success: true, 
    data,
    timestamp: new Date().toISOString()
  })
}
```

### DELETE /api/clear-data
```typescript
// پاک کردن تمام داده‌ها
export async function DELETE() {
  await clearDatabase()
  
  return Response.json({ 
    success: true, 
    timestamp: new Date().toISOString()
  })
}
```

## استقرار (Deployment)

### Vercel
```bash
# تنظیمات محیطی
NEXT_PUBLIC_STORAGE_TYPE=hybrid
NEXT_PUBLIC_API_ENDPOINT=https://your-vercel-app.vercel.app
NEXT_PUBLIC_FALLBACK_TO_BROWSER=true
```

### Netlify
```bash
# تنظیمات محیطی
NEXT_PUBLIC_STORAGE_TYPE=hybrid
NEXT_PUBLIC_API_ENDPOINT=https://your-netlify-app.netlify.app
NEXT_PUBLIC_FALLBACK_TO_BROWSER=true
```

### سرور شخصی
```bash
# تنظیمات محیطی
NEXT_PUBLIC_STORAGE_TYPE=server
NEXT_PUBLIC_API_ENDPOINT=https://your-domain.com
NEXT_PUBLIC_FALLBACK_TO_BROWSER=false
```

## مزایای سیستم

### 🔒 امنیت
- اعتبارسنجی داده‌ها
- مدیریت خطاها
- پشتیبان‌گیری خودکار

### 📱 سازگاری
- کار در تمام مرورگرها
- پشتیبانی از دستگاه‌های موبایل
- عملکرد بهینه

### 🚀 انعطاف‌پذیری
- تغییر آسان نوع ذخیره‌سازی
- پشتیبانی از محیط‌های مختلف
- قابلیت توسعه آسان

### 💡 کاربرپسندی
- رابط کاربری ساده
- بازخورد فوری
- مدیریت آسان تغییرات

## عیب‌یابی

### مشکل: داده‌ها ذخیره نمی‌شوند
```typescript
// بررسی وضعیت ذخیره‌سازی
const status = await storageService.getStatus()
console.log('Storage status:', status)

// بررسی خطاها
try {
  await storageService.saveData(data)
} catch (error) {
  console.error('Save error:', error)
}
```

### مشکل: تغییرات اعمال نمی‌شوند
```typescript
// بررسی تغییرات
console.log('Has unsaved changes:', hasUnsavedChanges)
console.log('Pending changes:', pendingChanges)

// اعمال تغییرات
await saveChanges()
```

### مشکل: پشتیبان بازیابی نمی‌شود
```typescript
// بررسی ساختار فایل
const backupData = JSON.parse(jsonString)
console.log('Backup structure:', Object.keys(backupData))

// بازیابی با خطاگیری
try {
  const result = await importData(jsonString)
  console.log('Import result:', result)
} catch (error) {
  console.error('Import error:', error)
}
```

## پشتیبانی

برای سوالات و مشکلات:
1. بررسی لاگ‌های کنسول
2. بررسی وضعیت ذخیره‌سازی
3. تست با داده‌های ساده
4. بررسی تنظیمات محیطی

## آینده

### ویژگی‌های برنامه‌ریزی شده
- [ ] همگام‌سازی چند کاربره
- [ ] تاریخچه تغییرات
- [ ] بازیابی خودکار
- [ ] رمزگذاری داده‌ها
- [ ] API rate limiting
- [ ] WebSocket برای تغییرات زنده

### بهبودهای پیشنهادی
- [ ] پشتیبانی از IndexedDB
- [ ] فشرده‌سازی داده‌ها
- [ ] کش هوشمند
- [ ] آمار استفاده
- [ ] گزارش‌گیری
