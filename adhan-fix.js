// محراب الجزائر - نظام الآذان التلقائي بـ GPS - عربي 100%
(function(){
  console.log('🕌 محراب الجزائر - بدء نظام الآذان...');

  if('Notification' in window && Notification.permission!=='granted'){
    Notification.requestPermission();
  }

  let تم_فتح_الصوت=false;
  const فتح_الصوت = ()=>{
    if(!تم_فتح_الصوت){
      try{ const a=new Audio(); a.play().catch(()=>{});}catch(e){}
      تم_فتح_الصوت=true;
      console.log('🔓 تم فتح الصوت - وضع GPS');
    }
  };
  document.addEventListener('click', فتح_الصوت, {once:true});
  document.addEventListener('touchstart', فتح_الصوت, {once:true});

  window.playAdhanAuto = function(اسم_الصلاة){
    اسم_الصلاة=اسم_الصلاة||'الصلاة';
    console.log('🔊 حان وقت ' + اسم_الصلاة + ' 🕌');
    
    if('Notification' in window && Notification.permission==='granted'){
      try{
        new Notification('حان وقت '+اسم_الصلاة+' 🕌',{
          body:'حي على الصلاة - محراب الجزائر',
          icon:'./icon-192x192.png',
          badge:'./icon-192x192.png',
          vibrate:[1000,500,1000],
          requireInteraction:true,
          tag:'adhan'
        });
      }catch(e){}
    }
    
    try{
      const روابط = ['./azan.mp3','./adjan.mp3','./adhan.mp3','https://cdn.islamic.network/adhan/mp3/01.mp3'];
      let فهرس=0;
      function جرب_التشغيل(){
        if(فهرس>=روابط.length) return;
        const صوت=new Audio(روابط[فهرس]);
        صوت.volume=1;
        صوت.play().then(()=>console.log('▶️ تشغيل الآذان من: '+روابط[فهرس])).catch(()=>{فهرس++; جرب_التشغيل();});
      }
      جرب_التشغيل();
    }catch(e){}
  };

  let خط_العرض = null;
  let خط_الطول = null;

  async function جلب_أوقات_الصلاة(){
    try{
      let رابط;
      if(خط_العرض && خط_الطول){
        const تاريخ = new Date();
        const يوم = String(تاريخ.getDate()).padStart(2,'0');
        const شهر = String(تاريخ.getMonth()+1).padStart(2,'0');
        const سنة = تاريخ.getFullYear();
        رابط = `https://api.aladhan.com/v1/timings/${يوم}-${شهر}-${سنة}?latitude=${خط_العرض}&longitude=${خط_الطول}&method=3`;
        console.log('📍 أوقات الصلاة حسب GPS:', خط_العرض, خط_الطول);
      } else {
        رابط = `https://api.aladhan.com/v1/timingsByCity?city=Algiers&country=Algeria&method=3`;
        console.log('🏙️ أوقات الصلاة الافتراضية: الجزائر العاصمة');
      }
      const استجابة=await fetch(رابط);
      const بيانات=await استجابة.json();
      return بيانات.data.timings;
    }catch(e){
      console.log('❌ فشل جلب الأوقات',e);
      return null;
    }
  }

  function جدولة_اليوم(أوقات){
    if(!أوقات) return;
    const صلوات = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
    const أسماء = {Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
    const الآن=new Date();
    console.log('📅 جدولة اليوم - الآن: ' + الآن.toLocaleTimeString('ar-DZ'));
    صلوات.forEach(صلاة=>{
      const وقت=أوقات[صلاة];
      if(!وقت) return;
      const [س,د]=وقت.split(':').map(Number);
      const هدف=new Date();
      هدف.setHours(س,د,0,0);
      let فرق=هدف-الآن;
      if(فرق<0) فرق+=24*60*60*1000;
      console.log(`→ 🕐 ${أسماء[صلاة]} على الساعة ${وقت} - بعد ${Math.round(فرق/1000/60)} دقيقة`);
      setTimeout(()=>{ window.playAdhanAuto(أسماء[صلاة]); }, فرق);
    });
  }

  // محاولة جلب GPS
  if('geolocation' in navigator){
    console.log('🔍 جاري البحث عن موقعك...');
    navigator.geolocation.getCurrentPosition(
      (موقع)=>{
        خط_العرض = موقع.coords.latitude;
        خط_الطول = موقع.coords.longitude;
        console.log('✅ تم العثور على موقعك:', خط_العرض, خط_الطول);
        جلب_أوقات_الصلاة().then(أ=>جدولة_اليوم(أ));
      },
      (خطأ)=>{
        console.log('⚠️ لم يتم السماح بـ GPS، سيتم استخدام الجزائر العاصمة', خطأ);
        جلب_أوقات_الصلاة().then(أ=>جدولة_اليوم(أ));
      },
      {enableHighAccuracy:true, timeout:10000}
    );
  } else {
    جلب_أوقات_الصلاة().then(أ=>جدولة_اليوم(أ));
  }

  // فحص كل دقيقة
  setInterval(async ()=>{
    const أوقات=await جلب_أوقات_الصلاة();
    if(!أوقات) return;
    const الآن=new Date();
    const سا=String(الآن.getHours()).padStart(2,'0');
    const دق=String(الآن.getMinutes()).padStart(2,'0');
    const الحالي=سا+':'+دق;
    for(let م in أوقات){
      if(أوقات[م]===الحالي){
        const أسماء = {Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
        if(أسماء[م]){ window.playAdhanAuto(أسماء[م]); break; }
      }
    }
  }, 60000);

  const الآن2=new Date();
  const منتصف_الليل=new Date(); منتصف_الليل.setHours(24,1,0,0);
  setTimeout(()=>{ location.reload(); }, منتصف_الليل-الآن2);

  console.log('✅ محراب الجزائر - النظام العربي جاهز ويعمل بـ GPS');
})();
