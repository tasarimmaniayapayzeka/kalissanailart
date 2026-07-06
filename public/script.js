// ===== Kalissa Nail Art — etkileşim ve WhatsApp entegrasyonu =====

const WA_NUMARA = '905331661532';

const STILLER = [
  { id: 'french', ad: 'French',        foto: 'gorseller/french.webp', baslangicFiyat: 1200, aciklama: 'Zamansız zarafet: her kıyafete, her ortama uyan klasik beyaz uçlar. "Bakımlı ama abartısız" diyenlerin vazgeçilmezi.' },
  { id: 'cateye', ad: 'Cat Eye',       foto: 'gorseller/cateye.webp', baslangicFiyat: 1200, aciklama: 'Işıltılı ve manyetik geçişlerle göz alıcı bir derinlik. Modern, şık ve iddialı görünmek isteyenler için.', onerilen: true },
  { id: 'ombre',  ad: 'Ombre',         foto: 'gorseller/ombre.webp',  baslangicFiyat: 1200, aciklama: 'Yumuşak renk geçişleriyle doğal ama sofistike bir görünüm. Uzayan tırnakta bile zarif kalır.' },
  { id: 'inci',   ad: 'İnci Tozu',     foto: 'gorseller/inci.webp',   baslangicFiyat: 1200, aciklama: 'Sedefli parıltı: ışık vurdukça hafifçe renk değiştiren, zarif ve ışıltılı bir dokunuş.' },
  { id: 'gold',   ad: 'Gold Detay',    foto: 'gorseller/gold.webp',   baslangicFiyat: 1200, aciklama: 'Altın varak ve ince çizgilerle lüks vurgusu. Davetlerin ve özel günlerin favorisi.' },
  { id: 'nude',   ad: 'Soft Nude',     foto: 'gorseller/nude.webp',   baslangicFiyat: 1200, aciklama: 'Az, ama öz. Bakımlı ve doğal görünümün sırrı — ofisten akşam yemeğine her yere uyar.' },
  { id: 'protez', ad: 'Protez Tırnak', foto: 'gorseller/protez.webp', baslangicFiyat: 1700, aciklama: 'İdeal boy ve formda, doğal görünümlü ve dayanıklı tırnaklar. Kırık ve kısa tırnaklara profesyonel çözüm.' }
];

// fiyat: nakit fiyatı; fiyatKart: posterdeki özel kart fiyatı (yoksa nakit × 1.2)
const HIZMETLER = [
  { id: 'man-oje',    ad: 'Manikür + Kalıcı Oje El', fiyat: 1200 },
  { id: 'ped-oje',    ad: 'Pedikür + Kalıcı Oje El', fiyat: 1300 },
  { id: 'jel',        ad: 'Manikür + Jel Güçlendirme + Kalıcı Oje El', fiyat: 1400 },
  { id: 'jel-protez', ad: 'Manikür + Kalıcı Oje Jel + Protez Bakım', fiyat: 1500 },
  { id: 'protez',     ad: 'Manikür + Protez + Kalıcı Oje', fiyat: 1700 },
  { id: 'man-kadin',  ad: 'Manikür (Kadın)', fiyat: 800 },
  { id: 'man-erkek',  ad: 'Manikür (Erkek)', fiyat: 1150, fiyatKart: 1400 },
  { id: 'ped-kadin',  ad: 'Pedikür (Kadın)', fiyat: 900 },
  { id: 'ped-erkek',  ad: 'Pedikür (Erkek)', fiyat: 1250 },
  { id: 'batik',      ad: 'Batık Tırnak (Tek Tırnak)', fiyat: 500 }
];

// hizmetin seçili ödeme şekline göre fiyatı
function hizmetFiyat(h) {
  if (durum.odeme !== 'kart') return h.fiyat;
  return h.fiyatKart || Math.round(h.fiyat * KART_KATSAYI);
}

const KART_KATSAYI = 1.2; // kredi kartında %20 fark

// Stil seçilmeden önce detay panelinde gösterilen nakit kampanyası paketi
const KAMPANYA = {
  ad: 'Manikür + Protez + Kalıcı Oje',
  foto: 'gorseller/kampanya.webp',
  aciklama: 'Nakit kampanyasına özel pakette protez tırnak, manikür ve kalıcı oje bir arada. Üstelik tüm kalıcı oje işlemlerinde French, Cat Eye, Ombre veya İnci Tozu hediye.',
  fiyatNakit: 1700,
  fiyatKart: 2040
};
const KAMPANYA_WA_URL = 'https://wa.me/905331661532?text=' + encodeURIComponent(
  'Merhaba Kalissa 👋\nNakit kampanyasındaki paket için randevu almak istiyorum: Manikür + Protez + Kalıcı Oje — 1.700 TL (nakit).\nRandevu için uygun saatlerinizi öğrenebilir miyim?'
);

const durum = {
  stil: 'cateye',
  stilSecildi: false, // kullanıcı gerçekten bir stile tıkladı mı
  secilenHizmetler: new Set(),
  nailArt: false,
  nailArtTutar: 150,
  odeme: 'nakit'
};

const tl = (n) => n.toLocaleString('tr-TR') + ' TL';

// ---------- Stil seçici ----------
const stilIzgara = document.getElementById('stilIzgara');

STILLER.forEach((stil) => {
  const kart = document.createElement('button');
  kart.type = 'button';
  kart.className = 'stil-kart';
  kart.dataset.stil = stil.id;
  kart.setAttribute('aria-pressed', 'false');
  kart.innerHTML = `<img class="stil-foto" src="${stil.foto}" alt="${stil.ad} nail art" loading="lazy"><span class="stil-kart-ad">${stil.ad}</span>`;
  kart.addEventListener('click', () => {
    durum.stil = stil.id;
    durum.stilSecildi = true;
    document.querySelectorAll('.stil-kart').forEach((k) => {
      const secili = k.dataset.stil === stil.id;
      k.classList.toggle('secili', secili);
      k.setAttribute('aria-pressed', String(secili));
    });
    stilDetayGuncelle();
    waLinkleriGuncelle();
  });
  stilIzgara.appendChild(kart);
});

function stilDetayGuncelle() {
  const stil = STILLER.find((s) => s.id === durum.stil);
  const etiket = document.getElementById('detayEtiket');
  etiket.textContent = 'ÖNERİLEN';
  etiket.classList.remove('etiket-kampanya');
  etiket.hidden = !stil.onerilen;
  document.getElementById('detayAd').textContent = stil.ad;
  document.getElementById('detayAciklama').textContent = stil.aciklama;
  document.getElementById('detayFiyatNot').textContent = 'Başlangıç Fiyatı (Nakit)';
  document.getElementById('detayFiyat').textContent = tl(stil.baslangicFiyat);
  document.getElementById('detayFiyatEk').textContent = '+ stil detayına göre 50–350 TL nail art farkı';
  const foto = document.getElementById('detayFoto');
  foto.src = stil.foto;
  foto.alt = stil.ad + ' nail art';
  document.getElementById('detayCta').textContent = 'Bu Stile Randevu Al 🗓';
}

// Varsayılan panel: nakit kampanyası paketi
function kampanyaPanelGoster() {
  const etiket = document.getElementById('detayEtiket');
  etiket.textContent = 'NAKİT KAMPANYASI';
  etiket.classList.add('etiket-kampanya');
  etiket.hidden = false;
  document.getElementById('detayAd').textContent = KAMPANYA.ad;
  document.getElementById('detayAciklama').textContent = KAMPANYA.aciklama;
  document.getElementById('detayFiyatNot').textContent = 'Kampanya Fiyatı (Nakit)';
  document.getElementById('detayFiyat').textContent = tl(KAMPANYA.fiyatNakit);
  document.getElementById('detayFiyatEk').textContent = 'kredi kartıyla ' + tl(KAMPANYA.fiyatKart);
  const foto = document.getElementById('detayFoto');
  foto.src = KAMPANYA.foto;
  foto.alt = KAMPANYA.ad + ' — nakit kampanyası';
  const cta = document.getElementById('detayCta');
  cta.textContent = 'Bu Pakete Randevu Al 🎁';
  cta.href = KAMPANYA_WA_URL;
}

// ---------- Hizmet listesi ----------
const hizmetListe = document.getElementById('hizmetListe');
const fiyatEtiketleri = new Map();

HIZMETLER.forEach((h) => {
  const kutu = document.createElement('label');
  kutu.className = 'hizmet-kutu';
  kutu.innerHTML = `<input type="checkbox" data-hizmet="${h.id}"><span class="hizmet-ad">${h.ad}</span><span class="hizmet-fiyat">${tl(h.fiyat)}</span>`;
  fiyatEtiketleri.set(h.id, kutu.querySelector('.hizmet-fiyat'));
  kutu.querySelector('input').addEventListener('change', (e) => {
    if (e.target.checked) durum.secilenHizmetler.add(h.id);
    else durum.secilenHizmetler.delete(h.id);
    kutu.classList.toggle('secili', e.target.checked);
    ozetGuncelle();
  });
  hizmetListe.appendChild(kutu);
});

// ödeme şekli değişince soldaki fiyat etiketleri de aynı fiyatı göstersin
function fiyatEtiketleriGuncelle() {
  HIZMETLER.forEach((h) => {
    fiyatEtiketleri.get(h.id).textContent = tl(hizmetFiyat(h));
  });
}

// ---------- Nail art ----------
const nailartSecim = document.getElementById('nailartSecim');
const nailartAyar = document.getElementById('nailartAyar');
const nailartSeviye = document.getElementById('nailartSeviye');
const nailartDeger = document.getElementById('nailartDeger');

nailartSecim.addEventListener('change', () => {
  durum.nailArt = nailartSecim.checked;
  nailartAyar.hidden = !durum.nailArt;
  ozetGuncelle();
});

nailartSeviye.addEventListener('input', () => {
  durum.nailArtTutar = Number(nailartSeviye.value);
  nailartDeger.textContent = tl(durum.nailArtTutar);
  ozetGuncelle();
});

// ---------- Ödeme seçimi ----------
document.querySelectorAll('.odeme-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    durum.odeme = pill.dataset.odeme;
    document.querySelectorAll('.odeme-pill').forEach((p) => {
      p.classList.toggle('secili', p === pill);
      p.setAttribute('aria-checked', String(p === pill));
    });
    document.getElementById('toplamNot').textContent =
      durum.odeme === 'nakit' ? 'Nakit fiyatlarıyla hesaplanıyor.' : 'Kredi kartı fiyatlarıyla (+%20) hesaplanıyor.';
    fiyatEtiketleriGuncelle();
    ozetGuncelle();
  });
});

// ---------- Toplam & özet ----------
function toplamHesapla() {
  let toplam = 0;
  durum.secilenHizmetler.forEach((id) => {
    toplam += hizmetFiyat(HIZMETLER.find((h) => h.id === id));
  });
  if (durum.nailArt) {
    toplam += durum.odeme === 'kart' ? Math.round(durum.nailArtTutar * KART_KATSAYI) : durum.nailArtTutar;
  }
  return toplam;
}

function ozetGuncelle() {
  const liste = document.getElementById('ozetListe');
  liste.innerHTML = '';

  const carpan = durum.odeme === 'kart' ? KART_KATSAYI : 1;

  if (durum.secilenHizmetler.size === 0 && !durum.nailArt) {
    liste.innerHTML = '<li class="bos">Henüz hizmet seçilmedi — listeden hizmet seçin.</li>';
  } else {
    durum.secilenHizmetler.forEach((id) => {
      const h = HIZMETLER.find((x) => x.id === id);
      const li = document.createElement('li');
      li.innerHTML = `<span>${h.ad}</span><strong>${tl(hizmetFiyat(h))}</strong>`;
      liste.appendChild(li);
    });
    if (durum.nailArt) {
      const li = document.createElement('li');
      li.innerHTML = `<span>Nail Art</span><strong>${tl(Math.round(durum.nailArtTutar * carpan))}</strong>`;
      liste.appendChild(li);
    }
  }

  document.getElementById('toplamDeger').textContent = tl(toplamHesapla());
  waLinkleriGuncelle();
}

// ---------- WhatsApp mesajı ----------
function waMesajOlustur() {
  const stil = STILLER.find((s) => s.id === durum.stil);
  const satirlar = ['Merhaba Kalissa 👋'];

  // stil satırı yalnızca kullanıcı gerçekten bir stil seçtiyse eklenir
  if (durum.stilSecildi) satirlar.push(`Stil: ${stil.ad}`);

  if (durum.secilenHizmetler.size > 0 || durum.nailArt) {
    const adlar = [];
    durum.secilenHizmetler.forEach((id) => adlar.push(HIZMETLER.find((h) => h.id === id).ad));
    if (durum.nailArt) adlar.push(`Nail Art (${tl(durum.nailArtTutar)})`);
    satirlar.push(`Hizmetler: ${adlar.join(', ')}`);
    satirlar.push(`Ödeme: ${durum.odeme === 'nakit' ? 'Nakit' : 'Kredi Kartı'} — Toplam yaklaşık ${tl(toplamHesapla())}`);
  }

  satirlar.push('Randevu için uygun saatlerinizi öğrenebilir miyim?');
  return satirlar.join('\n');
}

function waLinkleriGuncelle() {
  const url = `https://wa.me/${WA_NUMARA}?text=${encodeURIComponent(waMesajOlustur())}`;
  document.querySelectorAll('.wa-dinamik').forEach((a) => { a.href = url; });
  // panel stil modundaysa paneldeki CTA da güncel mesajı taşır (kampanya modunda sabit kalır)
  if (durum.stilSecildi) document.getElementById('detayCta').href = url;
}

// ---------- Galeri ----------
const GALERI = [
  { stil: 'imza',   ad: 'İmza: Cat Eye & Gold' },
  { stil: 'hero',   ad: 'Altın Dokunuş' },
  { stil: 'french', ad: 'French İncelik' },
  { stil: 'cateye', ad: 'Bordo Cat Eye' },
  { stil: 'ombre',  ad: 'Pudra Ombre' },
  { stil: 'inci',   ad: 'İnci Işıltısı' },
  { stil: 'gold',   ad: 'Gold Varak' },
  { stil: 'nude',   ad: 'Soft Nude' }
];

const galeriIzgara = document.getElementById('galeriIzgara');

GALERI.forEach((g) => {
  const kart = document.createElement('a');
  kart.className = 'galeri-kart';
  kart.href = 'https://www.instagram.com/kalissabeautywellness/';
  kart.target = '_blank';
  kart.rel = 'noopener';
  kart.innerHTML = `
    <img class="galeri-foto" src="gorseller/${g.stil}.webp" alt="${g.ad} nail art çalışması" loading="lazy">
    <span class="galeri-etiket"><span>${g.ad}</span><small>Instagram ↗</small></span>`;
  galeriIzgara.appendChild(kart);
});

// ---------- Sayfa içi bağlantılar: her tarayıcıda güvenilir yumuşak kaydırma ----------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const hedef = document.getElementById(id);
    if (!hedef) return;
    e.preventDefault();
    hedef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', '#' + id);
  });
});

// ---------- Hamburger menü ----------
const menuDugme = document.getElementById('menuDugme');
const mobilMenu = document.getElementById('mobilMenu');

function mobilMenuKapat() {
  mobilMenu.hidden = true;
  menuDugme.classList.remove('acik');
  menuDugme.setAttribute('aria-expanded', 'false');
  menuDugme.setAttribute('aria-label', 'Menüyü aç');
}

menuDugme.addEventListener('click', () => {
  if (mobilMenu.hidden) {
    mobilMenu.hidden = false;
    menuDugme.classList.add('acik');
    menuDugme.setAttribute('aria-expanded', 'true');
    menuDugme.setAttribute('aria-label', 'Menüyü kapat');
  } else {
    mobilMenuKapat();
  }
});

// bağlantıya dokununca menü kapanır, sayfa yumuşakça bölüme kayar
mobilMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', mobilMenuKapat));

// ---------- Scrollspy: masaüstü menüde aktif bölüm vurgusu ----------
const spyLinkleri = [...document.querySelectorAll('.ustmenu a')];
const spyBolumleri = spyLinkleri
  .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
  .filter(Boolean);

function scrollSpyGuncelle() {
  const esik = window.innerHeight * 0.4;
  let aktifId = null;
  spyBolumleri.forEach((bolum) => {
    if (bolum.getBoundingClientRect().top <= esik) aktifId = bolum.id;
  });
  spyLinkleri.forEach((a) => a.classList.toggle('aktif', a.getAttribute('href') === '#' + aktifId));
}

window.addEventListener('scroll', scrollSpyGuncelle, { passive: true });
scrollSpyGuncelle();

// ---------- Hero videosu: otomatik oynatma engellenirse ilk etkileşimde dene ----------
const heroVideo = document.querySelector('.hero-foto-kart video');
if (heroVideo) {
  const oynat = () => { heroVideo.play().catch(() => {}); };
  oynat();
  document.addEventListener('pointerdown', () => { if (heroVideo.paused) oynat(); }, { once: true });
}

// ---------- Kalissa Asistan (sohbet) ----------
const sohbetDugme = document.getElementById('sohbetDugme');
const sohbetDugmeIkon = document.getElementById('sohbetDugmeIkon');
const sohbetPanel = document.getElementById('sohbetPanel');
const sohbetKapatDugme = document.getElementById('sohbetKapat');
const sohbetMesajlar = document.getElementById('sohbetMesajlar');
const sohbetSecenekler = document.getElementById('sohbetSecenekler');
const sohbetIpucu = document.getElementById('sohbetIpucu');

const waGuncelUrl = () => `https://wa.me/${WA_NUMARA}?text=${encodeURIComponent(waMesajOlustur())}`;

const SOHBET_KONULARI = {
  fiyat: {
    cip: '💅 Fiyatlar',
    cevap: 'Nakit fiyatlarımızdan birkaçı:\nManikür + Kalıcı Oje 1.200 TL\nPedikür + Kalıcı Oje 1.300 TL\nProtez paketi 1.700 TL\nNail art 50–350 TL\n\nToplamınızı sayfadaki hesaplayıcıyla 10 saniyede görebilirsiniz 👇',
    eylemler: [
      { metin: 'Hesaplayıcıya Git →', tur: 'kaydir', hedef: 'fiyat' },
      { metin: "WhatsApp'tan Sorun →", tur: 'wa' }
    ]
  },
  kampanya: {
    cip: '🎁 Kampanya',
    cevap: 'Nakit ödemelerde %17\'ye varan avantaj var ✦\nÜstelik tüm kalıcı oje işlemlerinde French, Cat Eye, Ombre veya İnci Tozu hediye — seçim sizin!',
    eylemler: [
      { metin: 'Kampanyayı Gör →', tur: 'kaydir', hedef: 'kampanya' },
      { metin: 'Randevu Al →', tur: 'wa' }
    ]
  },
  saat: {
    cip: '🕐 Saatler',
    cevap: 'Çalışma saatlerimiz:\nPzt – Cum 09:00 – 21:00\nCumartesi 09:00 – 20:00\nPazar kapalıyız 💤',
    eylemler: [
      { metin: 'Randevu Al →', tur: 'wa' }
    ]
  },
  adres: {
    cip: '📍 Adres',
    cevap: 'Fenerbahçe Mah. Fener Kalamış Cd. No:21\nÜnver Apt. Daire:1, Kadıköy / İstanbul',
    eylemler: [
      { metin: 'Yol Tarifi Al →', tur: 'link', href: 'https://www.google.com/maps/dir/?api=1&destination=Kalissa%20Beauty%20%26%20Wellness%2C%20Fener%20Kalam%C4%B1%C5%9F%20Cd.%20No%3A21%2C%20Fenerbah%C3%A7e%2C%20Kad%C4%B1k%C3%B6y' },
      { metin: 'Hemen Arayın →', tur: 'link', href: 'tel:+905415432598' }
    ]
  },
  randevu: {
    cip: '📅 Randevu',
    cevap: 'En hızlısı WhatsApp 💬 Sayfada stil veya hizmet seçtiyseniz mesajınız hazır bile geliyor!',
    eylemler: [
      { metin: "WhatsApp'ı Aç →", tur: 'wa' },
      { metin: 'Telefonla Arayın →', tur: 'link', href: 'tel:+905415432598' }
    ]
  }
};

function sohbetKaydir() { sohbetMesajlar.scrollTop = sohbetMesajlar.scrollHeight; }

function botMesajEkle(metin, eylemler) {
  const balon = document.createElement('div');
  balon.className = 'mesaj-bot';
  balon.textContent = metin;
  if (eylemler && eylemler.length) {
    const kutu = document.createElement('div');
    kutu.className = 'mesaj-eylemler';
    eylemler.forEach((e) => {
      const a = document.createElement('a');
      a.className = 'eylem-link';
      a.textContent = e.metin;
      if (e.tur === 'kaydir') {
        a.href = '#' + e.hedef;
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          sohbetKapat();
          document.getElementById(e.hedef).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else if (e.tur === 'wa') {
        a.href = waGuncelUrl();
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        a.href = e.href;
        if (e.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      }
      kutu.appendChild(a);
    });
    balon.appendChild(kutu);
  }
  sohbetMesajlar.appendChild(balon);
  sohbetKaydir();
}

function yaziyorGoster(sureMs) {
  const balon = document.createElement('div');
  balon.className = 'mesaj-bot yaziyor';
  balon.innerHTML = '<i></i><i></i><i></i>';
  sohbetMesajlar.appendChild(balon);
  sohbetKaydir();
  return new Promise((coz) => setTimeout(() => { balon.remove(); coz(); }, sureMs));
}

function cipleriGoster() {
  sohbetSecenekler.innerHTML = '';
  Object.keys(SOHBET_KONULARI).forEach((anahtar) => {
    const konu = SOHBET_KONULARI[anahtar];
    const cip = document.createElement('button');
    cip.type = 'button';
    cip.className = 'secenek-cip';
    cip.textContent = konu.cip;
    cip.addEventListener('click', async () => {
      const kullanici = document.createElement('div');
      kullanici.className = 'mesaj-kullanici';
      kullanici.textContent = konu.cip;
      sohbetMesajlar.appendChild(kullanici);
      sohbetKaydir();
      sohbetSecenekler.innerHTML = '';
      await yaziyorGoster(650);
      botMesajEkle(konu.cevap, konu.eylemler);
      cipleriGoster();
    });
    sohbetSecenekler.appendChild(cip);
  });
}

let sohbetBaslatildi = false;

async function sohbetAc() {
  sohbetPanel.hidden = false;
  sohbetDugme.setAttribute('aria-expanded', 'true');
  sohbetDugme.setAttribute('aria-label', 'Sohbet asistanını kapat');
  sohbetDugmeIkon.textContent = '✕';
  sohbetIpucu.hidden = true;
  if (!sohbetBaslatildi) {
    sohbetBaslatildi = true;
    await yaziyorGoster(550);
    botMesajEkle('Merhaba! 👋 Kalissa\'ya hoş geldiniz.\nSize nasıl yardımcı olabilirim? ✦');
    cipleriGoster();
  }
}

function sohbetKapat() {
  sohbetPanel.hidden = true;
  sohbetDugme.setAttribute('aria-expanded', 'false');
  sohbetDugme.setAttribute('aria-label', 'Sohbet asistanını aç');
  sohbetDugmeIkon.textContent = '💅';
}

sohbetDugme.addEventListener('click', () => { sohbetPanel.hidden ? sohbetAc() : sohbetKapat(); });
sohbetKapatDugme.addEventListener('click', sohbetKapat);

// nazik ipucu: 4 sn sonra görün, 9 sn sonra veya açılınca kaybol
setTimeout(() => {
  if (sohbetPanel.hidden) {
    sohbetIpucu.hidden = false;
    setTimeout(() => { sohbetIpucu.hidden = true; }, 9000);
  }
}, 4000);

// ---------- Başlangıç ----------
kampanyaPanelGoster();
ozetGuncelle();
