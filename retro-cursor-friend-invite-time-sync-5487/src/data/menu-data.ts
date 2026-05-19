import { MenuData } from '@/types/menu'

export const menuData: MenuData = {
  categories: [
    {
      id: 'desserts',
      name: 'کیک و دسر',
      icon: 'dessert'
    },
    {
      id: 'espresso-based',
      name: 'نوشیدنی بر پایه اسپرسو',
      icon: ''
    },
    {
      id: 'pour-over',
      name: 'قهوه دمی',
      icon: ''
    },
    {
      id: 'tea-herbal',
      name: 'چای و دمنوش',
      icon: ''
    },
    {
      id: 'cold-drinks',
      name: 'نوشیدنی سرد و میلک شیک',
      icon: ''
    },
    {
      id: 'breakfast',
      name: 'صبحانه',
      icon: ''
    },
    {
      id: 'food-salad',
      name: 'غذا و سالاد',
      icon: ''
    }
  ],
  items: [
    // نوشیدنی بر پایه اسپرسو
    {
      id: 1,
      category: 'espresso-based',
      title: 'اسپرسو',
      description: 'قهوه اسپرسو ایتالیایی با طعم غلیظ و عطر دلپذیر',
      price: 109,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      category: 'espresso-based',
      title: 'آمریکنو',
      description: 'اسپرسو با آب داغ برای طعم ملایم‌تر و حجم بیشتر',
      price: 109,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      category: 'espresso-based',
      title: 'کورتادو',
      description: 'اسپرسو با مقدار کمی شیر بخار دیده',
      price: 115,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      category: 'espresso-based',
      title: 'کافه ماکیاتو',
      description: 'اسپرسو با مقدار کمی شیر و کف شیر',
      price: 127,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      category: 'espresso-based',
      title: 'دبل کارامل',
      description: 'اسپرسو با شیر بخار دیده و سیروپ کارامل',
      price: 132,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      category: 'espresso-based',
      title: 'کاپوچینو',
      description: 'اسپرسو با شیر بخار دیده و کف شیر خامه‌ای',
      price: 127,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 7,
      category: 'espresso-based',
      title: 'فلت وایت',
      description: 'اسپرسو با شیر بخار دیده و لایه نازک کف شیر',
      price: 127,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 8,
      category: 'espresso-based',
      title: 'کافه لاته',
      description: 'اسپرسو با شیر بخار دیده و لایه نازک کف شیر',
      price: 132,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 9,
      category: 'espresso-based',
      title: 'کافه لاته همراه با سیروپ',
      description: 'کافه لاته با سیروپ انتخابی',
      price: 145,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 10,
      category: 'espresso-based',
      title: 'اسپرسو ماکیاتو',
      description: 'اسپرسو با مقدار کمی شیر',
      price: 119,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 11,
      category: 'espresso-based',
      title: 'موکاچینو',
      description: 'اسپرسو با شیر بخار دیده، شکلات تلخ و کف شیر خامه‌ای',
      price: 145,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 12,
      category: 'espresso-based',
      title: 'کارامل ماکیاتو',
      description: 'اسپرسو با شیر بخار دیده و سیروپ کارامل',
      price: 145,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 13,
      category: 'espresso-based',
      title: 'آفوگاتو',
      description: 'اسپرسو با بستنی وانیلی',
      price: 132,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 14,
      category: 'espresso-based',
      title: 'کافه گلاسه',
      description: 'اسپرسو سرد با بستنی وانیلی',
      price: 179,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },

    // قهوه دمی
    {
      id: 15,
      category: 'pour-over',
      title: 'قهوه دمی تخصصی',
      description: 'قهوه دمی با روش‌های تخصصی و طعم‌های منحصر به فرد',
      price: 139,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 16,
      category: 'pour-over',
      title: 'قهوه دمی ویژه',
      description: 'قهوه دمی با دانه‌های انتخاب شده و طعم استثنایی',
      price: 149,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },

    // چای و دمنوش
    {
      id: 17,
      category: 'tea-herbal',
      title: 'چای سیاه',
      description: 'چای سیاه سنتی با طعم ملایم و عطر دلپذیر',
      price: 59,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 18,
      category: 'tea-herbal',
      title: 'چای سبز',
      description: 'چای سبز ژاپنی ممتاز با طعم ملایم علفی',
      price: 65,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 19,
      category: 'tea-herbal',
      title: 'چای ماسالا',
      description: 'چای هندی با ادویه‌های گرم و طعم منحصر به فرد',
      price: 139,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 20,
      category: 'tea-herbal',
      title: 'چای ترش',
      description: 'چای ترش با طعم ملایم و عطر دلپذیر',
      price: 65,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 21,
      category: 'tea-herbal',
      title: 'چای نعناع',
      description: 'چای نعناع تازه با طعم خنک و آرامش بخش',
      price: 65,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 22,
      category: 'tea-herbal',
      title: 'چای دارچین',
      description: 'چای دارچین با طعم گرم و آرامش بخش',
      price: 65,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 23,
      category: 'tea-herbal',
      title: 'چای هل',
      description: 'چای هل با طعم گرم و عطر دلپذیر',
      price: 65,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 24,
      category: 'tea-herbal',
      title: 'دمنوش آرامش',
      description: 'دمنوش گیاهی آرامش بخش با ترکیب خاص',
      price: 110,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 25,
      category: 'tea-herbal',
      title: 'دمنوش رویال',
      description: 'دمنوش سلطنتی با ترکیب گیاهان نادر',
      price: 110,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 26,
      category: 'tea-herbal',
      title: 'دمنوش انرژی',
      description: 'دمنوش انرژی بخش با ترکیب گیاهان طبیعی',
      price: 110,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },

    // نوشیدنی سرد و میلک شیک
    {
      id: 27,
      category: 'cold-drinks',
      title: 'لیموناد',
      description: 'لیموناد تازه و خنک با طعم طبیعی',
      price: 105,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 28,
      category: 'cold-drinks',
      title: 'موهیتو',
      description: 'نوشیدنی خنک با نعناع تازه و لیمو',
      price: 156,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 29,
      category: 'cold-drinks',
      title: 'واترملون فریز',
      description: 'نوشیدنی خنک هندوانه با طعم طبیعی',
      price: 156,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 30,
      category: 'cold-drinks',
      title: 'آیس تی لیمو نعناع',
      description: 'چای سرد با لیمو و نعناع تازه',
      price: 128,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 31,
      category: 'cold-drinks',
      title: 'کارامل فرپوچینو',
      description: 'نوشیدنی سرد با طعم کارامل و قهوه',
      price: 230,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 32,
      category: 'cold-drinks',
      title: 'لته فرپوچینو',
      description: 'نوشیدنی سرد با شیر و قهوه',
      price: 230,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 33,
      category: 'cold-drinks',
      title: 'شکلات فرپوچینو',
      description: 'نوشیدنی سرد با شکلات و قهوه',
      price: 230,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 34,
      category: 'cold-drinks',
      title: 'آیس کافی',
      description: 'قهوه سرد با طعم ملایم',
      price: 138,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 35,
      category: 'cold-drinks',
      title: 'ردبری',
      description: 'نوشیدنی خنک با طعم تمشک قرمز',
      price: 177,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 36,
      category: 'cold-drinks',
      title: 'پیناکولادا',
      description: 'نوشیدنی خنک با طعم آناناس و نارگیل',
      price: 177,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 37,
      category: 'cold-drinks',
      title: 'شیک نوتلا',
      description: 'میلک شیک با نوتلا و طعم شکلاتی',
      price: 217,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 38,
      category: 'cold-drinks',
      title: 'شیک اورئو',
      description: 'میلک شیک با بیسکویت اورئو',
      price: 217,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 39,
      category: 'cold-drinks',
      title: 'شیک نوتلا اورئو',
      description: 'میلک شیک ترکیبی نوتلا و اورئو',
      price: 247,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 40,
      category: 'cold-drinks',
      title: 'شیک اسپرسو',
      description: 'میلک شیک با طعم قهوه اسپرسو',
      price: 230,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 41,
      category: 'cold-drinks',
      title: 'شیک توت فرنگی',
      description: 'میلک شیک با توت فرنگی تازه',
      price: 215,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 42,
      category: 'cold-drinks',
      title: 'شیک وانیلا',
      description: 'میلک شیک کلاسیک با طعم وانیلا',
      price: 215,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 43,
      category: 'cold-drinks',
      title: 'شیک موز',
      description: 'میلک شیک با موز تازه و طعم طبیعی',
      price: 215,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 44,
      category: 'cold-drinks',
      title: 'شیک پسته',
      description: 'میلک شیک با طعم پسته و خامه',
      price: 230,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 45,
      category: 'cold-drinks',
      title: 'شیک تریو',
      description: 'میلک شیک ترکیبی با سه طعم مختلف',
      price: 247,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 46,
      category: 'cold-drinks',
      title: 'فریز',
      description: 'نوشیدنی خنک و تازه',
      price: 143,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },

    // صبحانه
    {
      id: 47,
      category: 'breakfast',
      title: 'املت شاکشوکا',
      description: 'املت با سس گوجه و ادویه‌های خاورمیانه‌ای',
      price: 338,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 48,
      category: 'breakfast',
      title: 'املت رترو',
      description: 'املت کلاسیک با سبزیجات تازه و پنیر',
      price: 279,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 49,
      category: 'breakfast',
      title: 'تست آووکادو',
      description: 'نان تست با آووکادو، تخم مرغ و سبزیجات',
      price: 258,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 50,
      category: 'breakfast',
      title: 'اسکرامبل اگ',
      description: 'تخم مرغ همزده با سبزیجات تازه',
      price: 157,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 51,
      category: 'breakfast',
      title: 'تست بادمجان و زیتون',
      description: 'نان تست با بادمجان کبابی و زیتون',
      price: 228,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 52,
      category: 'breakfast',
      title: 'چیا پودینگ',
      description: 'پودینگ چیا با میوه‌های تازه و آجیل',
      price: 218,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },

    // غذا و سالاد
    {
      id: 53,
      category: 'food-salad',
      title: 'چیکن ساته مرغ و خردل',
      description: 'سیخ مرغ با سس خردل و سبزیجات تازه',
      price: 383,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 54,
      category: 'food-salad',
      title: 'تست تونافیش',
      description: 'نان تست با ماهی تن و سبزیجات',
      price: 270,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 55,
      category: 'food-salad',
      title: 'چیکن ساته بادمجان و حمص',
      description: 'سیخ مرغ با بادمجان کبابی و حمص',
      price: 356,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 56,
      category: 'food-salad',
      title: 'پاستا میو پارمسان',
      description: 'پاستا با سس میو و پنیر پارمسان',
      price: 348,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 57,
      category: 'food-salad',
      title: 'پاستا اسپاگتی گردو',
      description: 'اسپاگتی با سس گردو و سبزیجات',
      price: 338,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 58,
      category: 'food-salad',
      title: 'پاستا آریابتا',
      description: 'پاستا با سس گوجه و فلفل قرمز',
      price: 270,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 59,
      category: 'food-salad',
      title: 'سالاد رترو',
      description: 'سالاد ویژه با ترکیب سبزیجات و پروتئین',
      price: 274,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 60,
      category: 'food-salad',
      title: 'سالاد یونانی',
      description: 'سالاد کلاسیک یونانی با زیتون و پنیر فتا',
      price: 286,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 61,
      category: 'food-salad',
      title: 'دیپ حمص',
      description: 'حمص خانگی با روغن زیتون و ادویه‌ها',
      price: 180,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },

    // کیک و دسر
    {
      id: 62,
      category: 'desserts',
      title: 'کیک شکلاتی',
      description: 'کیک شکلاتی گرم با مرکز مذاب و بستنی وانیلی',
      price: 189,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    },
    {
      id: 63,
      category: 'desserts',
      title: 'کیک وانیلی',
      description: 'کیک وانیلی کلاسیک با خامه زده و توت فرنگی تازه',
      price: 165,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    },
    {
      id: 64,
      category: 'desserts',
      title: 'کیک هویج',
      description: 'کیک هویج با خامه پنیر و گردو',
      price: 175,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    },
    {
      id: 65,
      category: 'desserts',
      title: 'کیک توت‌فرنگی',
      description: 'کیک توت فرنگی با خامه وانیلی و توت تازه',
      price: 185,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    },
    {
      id: 66,
      category: 'desserts',
      title: 'بستنی وانیلی',
      description: 'بستنی وانیلی خانگی با سس کارامل',
      price: 95,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
    },
    {
      id: 67,
      category: 'desserts',
      title: 'بستنی شکلاتی',
      description: 'بستنی شکلاتی غلیظ با تکه‌های شکلات تلخ',
      price: 105,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
    },
    {
      id: 68,
      category: 'desserts',
      title: 'بستنی زعفرانی',
      description: 'بستنی زعفرانی سنتی با طعم منحصر به فرد',
      price: 125,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
    },
    {
      id: 69,
      category: 'desserts',
      title: 'ژله میوه‌ای',
      description: 'ژله میوه‌ای رنگی با میوه‌های تازه',
      price: 75,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    },
    {
      id: 70,
      category: 'desserts',
      title: 'دونات شکری',
      description: 'دونات تازه با پودر شکر وانیلی',
      price: 85,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop'
    },
    {
      id: 71,
      category: 'desserts',
      title: 'براونی',
      description: 'براونی شکلاتی غلیظ با گردو و سس کارامل',
      price: 145,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    }
  ]
}
