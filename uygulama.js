(()=>{'use strict';
const d=window.CABUK_GELIR, $=id=>document.getElementById(id);
let online=false, stage=0, timer=null, noticeOpen=false, audio=null;
const steps=[['Siparişi kabul et','Yeni teslimat görevi'],['Restorana git','Beyti Kebap’a ulaş'],['Paketi teslim al','Restorandan alımı onayla'],['Teslimat noktasına git','FLY BODY FİT · Dolap No 27']];
const stages=[
['YENİ SİPARİŞ','Yeni teslimat','Beyti Kebap restoranından alınacak sipariş var.','Yeni sipariş alındı','Siparişi kabul ederek devam edin.','Siparişi Kabul Et'],
['SİPARİŞ KABUL EDİLDİ','Restorana gidiliyor','Beyti Kebap’a gidip paketi teslim alın.','Sipariş kabul edildi','Alım noktasına ilerleyin.','Restorana Vardım'],
['RESTORANDA','Paketinizi alın','Beyti Kebap restoranından siparişinizi teslim alın.','Restorana ulaşıldı','Paketi teslim aldıktan sonra onaylayın.','Paketi Teslim Aldım'],
['PAKET ALINDI','Teslimata gidiliyor','FLY BODY FİT teslimat noktasına ilerleyin.','Paket teslim alındı','Teslimat noktasına ilerleyin.','Teslimat Noktasına Vardım'],
['TESLİMAT NOKTASI','Dolap No 27','Spor salonundaki 27 numaralı dolaba ulaşın.','Teslimat noktasına ulaşıldı','Paketin bırakılmasını onaylayın.','Teslimatı Tamamla'],
['TAMAMLANDI','Teslimat tamamlandı','Sipariş başarıyla tamamlandı.','Teslimat tamamlandı','Siparişiniz kaydedildi.','Ana Sayfaya Dön']];
function hideNotice(){$('notice').classList.add('hidden');noticeOpen=false;}
function showPage(id){$('home').classList.toggle('active',id==='home');$('order').classList.toggle('active',id==='order');$('actionbar').classList.toggle('hidden',id==='home');$('homeBtn').classList.toggle('selected',id==='home');$('ordersBtn').classList.toggle('selected',id==='order');}
function draw(){hideNotice();showPage('order');const s=stages[stage];$('stageLabel').textContent=s[0];$('stageTitle').textContent=s[1];$('stageText').textContent=s[2];$('stateTitle').textContent=s[3];$('stateText').textContent=s[4];$('nextBtn').innerHTML=s[5]+' <span>→</span>'; for(let i=1;i<=4;i++)$('prog'+i).classList.toggle('filled',i<=stage);$('taskline').innerHTML=steps.map(([title,desc],i)=>`<div class="taskitem ${i<stage?'done':i===stage?'current':''}"><div class="taskdot">${i<stage?'✓':i+1}</div><div><strong>${title}</strong><small>${desc}</small></div></div>`).join('');}
function home(){stage=0;hideNotice();showPage('home');$('activeCount').textContent='0';$('empty').classList.remove('hidden');}
function prepareAudio(){if(!audio&&d.bildirimSesi){try{audio=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}}
function ping(){if(navigator.vibrate)navigator.vibrate([150,80,150]);if(!audio)return;try{if(audio.state==='suspended')audio.resume();[0,.16].forEach((t,i)=>{let o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=i?900:740;g.gain.setValueAtTime(.0001,audio.currentTime+t);g.gain.exponentialRampToValueAtTime(.09,audio.currentTime+t+.025);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+t+.14);o.connect(g).connect(audio.destination);o.start(audio.currentTime+t);o.stop(audio.currentTime+t+.15);});}catch(e){}}
function notify(){clearTimeout(timer);if(stage>0||noticeOpen)return;noticeOpen=true;$('notice').classList.remove('hidden');ping();}
function schedule(){clearTimeout(timer);if(online&&d.otomatikBildirim&&d.bildirimGecikmeMs>0)timer=setTimeout(notify,d.bildirimGecikmeMs);}
function toggleOnline(){online=!online;$('onlineBtn').classList.toggle('on',online);$('onlineBtn').setAttribute('aria-pressed',String(online));$('onlineText').textContent=online?'Çevrimiçi':'Çevrimdışı';$('waitTitle').textContent=online?'Sipariş bekleniyor':'Çevrimdışısınız';$('waitDesc').textContent=online?'Yeni teslimatlar otomatik olarak bildirilecek.':'Yeni sipariş almak için durumunuzu değiştirin.';$('homeHint').textContent=online?'Yeni siparişler size bildirim olarak iletilecek.':'Sipariş almak için çevrimiçi olun.';if(!online){hideNotice();clearTimeout(timer);}else{schedule();}}
$('onlineBtn').addEventListener('click',()=>{prepareAudio();toggleOnline();});
$('brand').addEventListener('click',()=>{prepareAudio();if(!online)toggleOnline();notify();});
$('viewNotice').onclick=()=>{stage=0;draw();};
$('acceptNotice').onclick=()=>{stage=1;draw();};
$('nextBtn').onclick=()=>{if(stage===5){home();return;}stage++;draw();};
$('homeBtn').onclick=()=>{hideNotice();showPage('home');};
$('ordersBtn').onclick=()=>{if(stage>0)draw();else{openSheet('Siparişler','Henüz aktif bir teslimatınız bulunmuyor.');}};
function openSheet(title,body){$('sheetTitle').textContent=title;$('sheetDesc').textContent=body;$('sheetwrap').classList.remove('hidden');}
$('profileBtn').onclick=()=>openSheet('Kurye hesabı','Hesap: '+d.kurye+' · '+(online?'Çevrimiçi':'Çevrimdışı'));
$('closeSheet').onclick=()=>{$('sheetwrap').classList.add('hidden');};
$('sheetwrap').onclick=e=>{if(e.target===$('sheetwrap'))$('sheetwrap').classList.add('hidden');};
$('repeatBtn').onclick=()=>{$('sheetwrap').classList.add('hidden');if(!online)toggleOnline();stage=0;showPage('home');notify();};
$('resetBtn').onclick=()=>{$('sheetwrap').classList.add('hidden');home();};
$('courierName').textContent=d.kurye;$('restName').textContent=d.restoran;$('pickup').textContent=d.restoran;$('destination').textContent=d.teslimat;$('destinationDesc').textContent=d.teslimatAciklama;
// Bildirim telefonda tarayıcının ses ilkesi gereği ilk dokunmadan sonra ses çıkarabilir.
})();
