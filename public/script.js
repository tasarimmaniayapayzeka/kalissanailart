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

const HIZMETLER = [
  { id: 'man-oje',    ad: 'Manikür + Kalıcı Oje El', fiyat: 1200 },
  { id: 'ped-oje',    ad: 'Pedikür + Kalıcı Oje El', fiyat: 1300 },
  { id: 'jel',        ad: 'Manikür + Jel Güçlendirme + Kalıcı Oje El', fiyat: 1400 },
  { id: 'jel-protez', ad: 'Manikür + Kalıcı Oje Jel + Protez Bakım', fiyat: 1500 },
  { id: 'protez',     ad: 'Manikür + Protez + Kalıcı Oje', fiyat: 1700 },
  { id: 'batik',      ad: 'Batık Tırnak (Tek Tırnak)', fiyat: 500 }
];

const KART_KATSAYI = 1.2; // kredi kartında %20 fark

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
  kart.className = 'stil-kart' + (stil.id === durum.stil ? ' secili' : '');
  kart.dataset.stil = stil.id;
  kart.setAttribute('aria-pressed', String(stil.id === durum.stil));
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
  document.getElementById('detayAd').textContent = stil.ad;
  document.getElementById('detayAciklama').textContent = stil.aciklama;
  document.getElementById('detayEtiket').hidden = !stil.onerilen;
  document.getElementById('detayFiyat').textContent = tl(stil.baslangicFiyat);
  const foto = document.getElementById('detayFoto');
  foto.src = stil.foto;
  foto.alt = stil.ad + ' nail art';
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
  const carpan = durum.odeme === 'kart' ? KART_KATSAYI : 1;
  HIZMETLER.forEach((h) => {
    fiyatEtiketleri.get(h.id).textContent = tl(Math.round(h.fiyat * carpan));
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
    toplam += HIZMETLER.find((h) => h.id === id).fiyat;
  });
  if (durum.nailArt) toplam += durum.nailArtTutar;
  if (durum.odeme === 'kart') toplam = Math.round(toplam * KART_KATSAYI);
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
      li.innerHTML = `<span>${h.ad}</span><strong>${tl(Math.round(h.fiyat * carpan))}</strong>`;
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

// "Bu Stile Randevu Al" panelde görünen stili taşır: tıklama anında stil seçilmiş sayılır
document.querySelectorAll('.wa-stil').forEach((buton) => {
  buton.addEventListener('pointerdown', () => {
    if (!durum.stilSecildi) {
      durum.stilSecildi = true;
      waLinkleriGuncelle();
    }
  });
});

// ---------- Hero videosu: otomatik oynatma engellenirse ilk etkileşimde dene ----------
const heroVideo = document.querySelector('.hero-foto-kart video');
if (heroVideo) {
  const oynat = () => { heroVideo.play().catch(() => {}); };
  oynat();
  document.addEventListener('pointerdown', () => { if (heroVideo.paused) oynat(); }, { once: true });
}

// ---------- Başlangıç ----------
stilDetayGuncelle();
ozetGuncelle();
