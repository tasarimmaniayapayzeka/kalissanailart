// ===== Kalissa Nail Art — etkileşim ve WhatsApp entegrasyonu =====

const WA_NUMARA = '905331661532';

const STILLER = [
  { id: 'french', ad: 'French',        aciklama: 'Zamansız zarafet: her kıyafete, her ortama uyan klasik beyaz uçlar. "Bakımlı ama abartısız" diyenlerin vazgeçilmezi.' },
  { id: 'cateye', ad: 'Cat Eye',       aciklama: 'Işıltılı ve manyetik geçişlerle göz alıcı bir derinlik. Modern, şık ve iddialı görünmek isteyenler için.', onerilen: true },
  { id: 'ombre',  ad: 'Ombre',         aciklama: 'Yumuşak renk geçişleriyle doğal ama sofistike bir görünüm. Uzayan tırnakta bile zarif kalır.' },
  { id: 'inci',   ad: 'İnci Tozu',     aciklama: 'Sedefli parıltı: ışık vurdukça hafifçe renk değiştiren, zarif ve ışıltılı bir dokunuş.' },
  { id: 'gold',   ad: 'Gold Detay',    aciklama: 'Altın varak ve ince çizgilerle lüks vurgusu. Davetlerin ve özel günlerin favorisi.' },
  { id: 'nude',   ad: 'Soft Nude',     aciklama: 'Az, ama öz. Bakımlı ve doğal görünümün sırrı — ofisten akşam yemeğine her yere uyar.' },
  { id: 'protez', ad: 'Protez Tırnak', aciklama: 'İdeal boy ve formda, doğal görünümlü ve dayanıklı tırnaklar. Kırık ve kısa tırnaklara profesyonel çözüm.' }
];

const HIZMETLER = [
  { id: 'man-oje',  ad: 'Manikür + Kalıcı Oje El', fiyat: 1200 },
  { id: 'ped-oje',  ad: 'Pedikür + Kalıcı Oje El', fiyat: 1300 },
  { id: 'jel',      ad: 'Manikür + Jel Güçlendirme + Kalıcı Oje El', fiyat: 1400 },
  { id: 'protez',   ad: 'Manikür + Protez + Kalıcı Oje', fiyat: 1700 },
  { id: 'batik',    ad: 'Batık Tırnak (Tek Tırnak)', fiyat: 500 }
];

const KART_KATSAYI = 1.2; // kredi kartında %20 fark

const durum = {
  stil: 'cateye',
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
  kart.innerHTML = `<span class="tirnak ${stil.id}"></span><span class="stil-kart-ad">${stil.ad}</span>`;
  kart.addEventListener('click', () => {
    durum.stil = stil.id;
    document.querySelectorAll('.stil-kart').forEach((k) => k.classList.toggle('secili', k.dataset.stil === stil.id));
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
  const gorsel = document.getElementById('detayTirnak');
  gorsel.className = 'tirnak dev ' + stil.id;
}

// ---------- Hizmet listesi ----------
const hizmetListe = document.getElementById('hizmetListe');

HIZMETLER.forEach((h) => {
  const kutu = document.createElement('label');
  kutu.className = 'hizmet-kutu';
  kutu.innerHTML = `<input type="checkbox" data-hizmet="${h.id}"><span class="hizmet-ad">${h.ad}</span><span class="hizmet-fiyat">${tl(h.fiyat)}</span>`;
  kutu.querySelector('input').addEventListener('change', (e) => {
    if (e.target.checked) durum.secilenHizmetler.add(h.id);
    else durum.secilenHizmetler.delete(h.id);
    kutu.classList.toggle('secili', e.target.checked);
    ozetGuncelle();
  });
  hizmetListe.appendChild(kutu);
});

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
    document.querySelectorAll('.odeme-pill').forEach((p) => p.classList.toggle('secili', p === pill));
    document.getElementById('toplamNot').textContent =
      durum.odeme === 'nakit' ? 'Nakit fiyatlarıyla hesaplanıyor.' : 'Kredi kartı fiyatlarıyla (+%20) hesaplanıyor.';
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
    liste.innerHTML = '<li class="bos">Henüz hizmet seçilmedi — soldan seçim yapın.</li>';
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

  satirlar.push(`Stil: ${stil.ad}`);

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
  { stil: 'french', ad: 'French İncelik' },
  { stil: 'cateye', ad: 'Bordo Cat Eye' },
  { stil: 'ombre',  ad: 'Pudra Ombre' },
  { stil: 'inci',   ad: 'İnci Işıltısı' },
  { stil: 'gold',   ad: 'Gold Varak' },
  { stil: 'nude',   ad: 'Soft Nude' }
];

const galeriIzgara = document.getElementById('galeriIzgara');
const ZEMINLER = {
  french: 'linear-gradient(150deg, #f6e8e0, #ecd2c4)',
  cateye: 'linear-gradient(150deg, #f0dcd5, #ddb4ab)',
  ombre:  'linear-gradient(150deg, #faeef0, #f0ccd4)',
  inci:   'linear-gradient(150deg, #f8f1ea, #e8e0e6)',
  gold:   'linear-gradient(150deg, #f5e6d4, #e6cba8)',
  nude:   'linear-gradient(150deg, #f5e3d8, #e5c6b4)'
};

GALERI.forEach((g) => {
  const kart = document.createElement('a');
  kart.className = 'galeri-kart';
  kart.href = 'https://www.instagram.com/kalissabeautywellness/';
  kart.target = '_blank';
  kart.rel = 'noopener';
  kart.style.background = ZEMINLER[g.stil];
  kart.innerHTML = `
    <span class="galeri-tirnaklar">
      <span class="tirnak mini ${g.stil}"></span>
      <span class="tirnak ${g.stil}"></span>
      <span class="tirnak mini ${g.stil}"></span>
    </span>
    <span class="galeri-etiket"><span>${g.ad}</span><small>Instagram ↗</small></span>`;
  galeriIzgara.appendChild(kart);
});

// ---------- Başlangıç ----------
stilDetayGuncelle();
ozetGuncelle();
