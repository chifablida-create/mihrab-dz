// FIX ADHAN AUTO - Mihrab DZ - خفيف
(function(){
  if('Notification' in window && Notification.permission!=='granted'){
    Notification.requestPermission();
  }
  let unlocked=false;
  const unlock = ()=>{ if(!unlocked){ try{new Audio().play().catch(()=>{});}catch(e){} unlocked=true; document.removeEventListener('click', unlock); }};
  document.addEventListener('click', unlock);
  document.addEventListener('touchstart', unlock, {once:true});
  window.playAdhanAuto = function(name){
    name = name || 'الصلاة';
    if('Notification' in window && Notification.permission==='granted'){
      try{
        new Notification('حان وقت '+name+' 🕌',{
          body:'حي على الصلاة - Mihrab DZ',
          icon:'./icon-192x192.png',
          vibrate:[1000,500,1000],
          requireInteraction:true,
          tag:'adhan'
        });
      }catch(e){}
    }
    try{
      const a = new Audio('./azan.mp3');
      a.play().catch(()=>{});
    }catch(e){}
  };
  console.log('Mihrab DZ adhan fix loaded');
})();
