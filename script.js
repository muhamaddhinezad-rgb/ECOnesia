var pages = ['home','input','riwayat','about'];
function goTo(p) {
    for (var i = 0; i < pages.length; i++) {
        document.getElementById('page-' + pages[i]).classList.remove('active');
        document.getElementById('nav-' + pages[i]).style.fontWeight = 'normal';
    }
    document.getElementById('page-' + p).classList.add('active');
    document.getElementById('nav-' + p).style.fontWeight = 'bold';
    window.scrollTo(0, 0);
}

// counter animasi
function animCount(id, target) {
    var el = document.getElementById(id);
    var start = 0;
    var step = Math.ceil(target / 60);
    var interval = setInterval(function() {
        start += step;
        if (start >= target) {
            el.textContent = target.toLocaleString('id-ID');
            clearInterval(interval);
        } else {
            el.textContent = start.toLocaleString('id-ID');
        }
    }, 25);
}

window.onload = function() {
    animCount('s-kg', 12480);
    animCount('s-warga', 847);
    animCount('s-poin', 248600);
    animCount('s-trans', 314);
    var today = new Date();
    var dd = String(today.getDate()).padStart(2,'0');
    var mm = String(today.getMonth()+1).padStart(2,'0');
    var yyyy = today.getFullYear();
    document.getElementById('f-tgl').value = yyyy+'-'+mm+'-'+dd;
    buildTbl();
};

// jenis plastik
var selType = 'PET';
var pm = {PET:100, HDPE:90, PVC:70, LDPE:60, PP:80, PS:50};

function pilih(el, type) {
    var btns = document.querySelectorAll('.jenis-btn');
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove('aktif');
    el.classList.add('aktif');
    selType = type;
    hitung();
}

function hitung() {
    var berat = parseFloat(document.getElementById('f-berat').value) || 0;
    var kondisi = document.getElementById('f-kondisi').value;
    var pts = berat * (pm[selType] || 100);
    if (kondisi === 'bersih') pts = pts * 1.1;
    pts = Math.round(pts);
    if (berat > 0) {
        document.getElementById('prev-pts').textContent = pts.toLocaleString('id-ID') + ' poin';
        document.getElementById('det-poin').textContent = berat + ' kg x ' + pm[selType] + ' (' + selType + ')' + (kondisi === 'bersih' ? ' + bonus 10%' : '');
    } else {
        document.getElementById('prev-pts').textContent = '—';
        document.getElementById('det-poin').textContent = 'Isi berat untuk melihat estimasi';
    }
}

// submit
var rows = [
    {tgl:'2026-05-18',jenis:'PET',berat:'3.2',kondisi:'bersih',poin:352,status:'Terverifikasi'},
    {tgl:'2026-05-12',jenis:'HDPE',berat:'2.5',kondisi:'kotor',poin:225,status:'Terverifikasi'},
    {tgl:'2026-05-05',jenis:'PP',berat:'4.0',kondisi:'bersih',poin:352,status:'Terverifikasi'},
    {tgl:'2026-04-28',jenis:'LDPE',berat:'1.8',kondisi:'kotor',poin:108,status:'Terverifikasi'},
    {tgl:'2026-04-15',jenis:'PET',berat:'5.0',kondisi:'bersih',poin:550,status:'Terverifikasi'},
    {tgl:'2026-04-07',jenis:'HDPE',berat:'3.5',kondisi:'kotor',poin:315,status:'Terverifikasi'},
    {tgl:'2026-03-25',jenis:'PP',berat:'2.2',kondisi:'bersih',poin:193,status:'Terverifikasi'},
    {tgl:'2026-03-10',jenis:'PET',berat:'6.0',kondisi:'bersih',poin:660,status:'Terverifikasi'},
];

function submit() {
    var nama = document.getElementById('f-nama').value.trim();
    var berat = parseFloat(document.getElementById('f-berat').value);
    if (!nama) { alert('Nama warga wajib diisi!'); return; }
    if (!berat || berat <= 0) { alert('Berat plastik wajib diisi!'); return; }
    var kondisi = document.getElementById('f-kondisi').value;
    var pts = berat * pm[selType];
    if (kondisi === 'bersih') pts = pts * 1.1;
    pts = Math.round(pts);
    var tgl = document.getElementById('f-tgl').value;
    rows.unshift({tgl:tgl, jenis:selType, berat:parseFloat(berat).toFixed(1), kondisi:kondisi||'kotor', poin:pts, status:'Menunggu Verifikasi'});

    var p = parseInt(document.getElementById('my-poin').textContent.replace(/\./g,'').replace(/,/g,'')) || 0;
    var k = parseFloat(document.getElementById('my-kg').textContent) || 0;
    var tr = parseInt(document.getElementById('my-tr').textContent) || 0;
    document.getElementById('my-poin').textContent = (p + pts).toLocaleString('id-ID');
    document.getElementById('my-kg').textContent = (k + berat).toFixed(1);
    document.getElementById('my-tr').textContent = tr + 1;
    buildTbl();

    var notif = document.getElementById('notif');
    notif.style.display = 'block';
    notif.textContent = 'Data berhasil disimpan! ' + pts.toLocaleString('id-ID') + ' poin akan dikreditkan setelah verifikasi.';
    setTimeout(function() {
        notif.style.display = 'none';
        goTo('riwayat');
    }, 2000);

    document.getElementById('f-nama').value = '';
    document.getElementById('f-id').value = '';
    document.getElementById('f-berat').value = '';
    document.getElementById('f-cat').value = '';
}

function buildTbl() {
    var bln = document.getElementById('fil-bln') ? document.getElementById('fil-bln').value : '';
    var jns = document.getElementById('fil-jns') ? document.getElementById('fil-jns').value : '';
    var body = document.getElementById('tbl-body');
    if (!body) return;
    var klabel = {bersih:'Bersih', kotor:'Kotor', campur:'Campuran'};
    var filtered = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var m = r.tgl.split('-')[1];
        if (bln && m !== bln) continue;
        if (jns && r.jenis !== jns) continue;
        filtered.push(r);
    }
    if (filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px">Tidak ada data</td></tr>';
        return;
    }
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var r = filtered[i];
        var d = new Date(r.tgl + ' ');
        var ds = d.toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'});
        var sc = r.status === 'Terverifikasi' ? 'color:green;font-weight:bold' : 'color:orange';
        html += '<tr>';
        html += '<td>' + ds + '</td>';
        html += '<td>' + r.jenis + '</td>';
        html += '<td>' + r.berat + ' kg</td>';
        html += '<td>' + (klabel[r.kondisi] || r.kondisi) + '</td>';
        html += '<td style="color:green;font-weight:bold">+' + r.poin.toLocaleString('id-ID') + '</td>';
        html += '<td style="' + sc + '">' + r.status + '</td>';
        html += '</tr>';
    }
    body.innerHTML = html;
}