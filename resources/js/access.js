// 'use strict';

// var hik=[
//   '192.168.20.102', // Masuk
//   '192.168.20.104', // Masuk
//   '192.168.20.106', // Masuk
//   '192.168.20.108', // Masuk
//   '192.168.20.118', // Masuk
//   '192.168.20.110', // Keluar
//   '192.168.20.112', // Keluar
//   '192.168.20.114', // Keluar
//   '192.168.20.116'  // Keluar
// ];

// document.addEventListener('DOMContentLoaded', function (e) {
//   renderStatus();
//   setInterval(() => {
//     renderStatus();
//   }, 5 * 60 * 1000);
//   const dtAccess = document.querySelector('.datatables-access')

//   $.ajaxSetup({
//     headers: {
//       'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//     }
//   });

//   if(dtAccess){
//     const dtAccessTable = new DataTable(dtAccess, {
//       processing: true,
//       serverSide: true,
//       responsive: true,
//       ajax:{
//         url: '/access/table',
//         type: 'GET',
//       },
//       columns:[
//         {
//           data: null,
//           render: function (data, type, row, meta) {
//             return meta.row + meta.settings._iDisplayStart + 1;
//           },
//           orderable: false,
//           searchable: false,
//         },
//         {data: 'number'},
//         {data: 'nama_pekerja'},
//         {data: 'nama_perusahaan'},
//         {data: 'expire'},
//         {data: 'rfid'},
//         {data: 'gender'},
//         {
//           data: 'rfid', orderable: false, render: function (data, type, row) {
//             return `<div class="d-flex align-items-center"><button type="button" class="btn btn-sm rounded-pill btn-outline-success checkData me-2" data-rfid="${data}"><i class="icon-base ti tabler-arrow-up-right"></i></button></div>`;
//           }
//         }
//       ]
//     })

//     document.addEventListener("click",async function (e) {
//       if (e.target.closest(".checkData")) {
//         document.getElementById('contentStatus').innerHTML = '';
//         const modal = new bootstrap.Modal(document.getElementById('modalCheck'));
//         const rfid = e.target.closest(".checkData").dataset.rfid;
//         // const user = e.target.closest(".btn-check").dataset.id;

//         Swal.fire({
//           title: "Memuat data...",
//           html: "Harap tunggu sebentar",
//           allowOutsideClick: false,
//           didOpen: () => {
//             Swal.showLoading();
//           }
//         });
//         for(const ip of hik){
//           await checkDataFromDevice(rfid, ip).then((res) => {
//             const endTime = res?.UserInfoSearch?.UserInfo?.[0]?.Valid?.endTime;
//             const isExpire = endTime ? new Date(endTime) > new Date() : false;
//             document.getElementById('contentStatus').innerHTML += `
//              <div class="col-lg-4 mb-4">
//                 <small class="fw-medium">${ip}</small>
//                 <div class="demo-inline-spacing mt-4">
//                   <ul class="list-group">
//                     <li class="list-group-item d-flex align-items-center">
//                       ${res.UserInfoSearch?.responseStatusStrg === "OK" ? ` <span class="me-2"><i
//                       class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
//                       class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
//                       Available On Device
//                     </li>
//                     <li class="list-group-item d-flex align-items-center">
//                       ${isExpire ?` <span class="me-2"><i
//                       class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
//                       class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
//                       Expire At : ${endTime || '-'}
//                     </li>
//                     <li class="list-group-item d-flex align-items-center">
//                       ${res?.UserInfoSearch?.UserInfo?.[0]?.numOfFace > 0 ? ` <span class="me-2"><i
//                       class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
//                       class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
//                       Has Face Data
//                     </li>
//                     <li class="list-group-item d-flex align-items-center">
//                       ${res?.UserInfoSearch?.UserInfo?.[0]?.numOfCard > 0 ? ` <span class="me-2"><i
//                       class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
//                       class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
//                       Has Card Data
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             `;
//           }).catch((err) => {
//             console.error(err);
//             document.getElementById('contentStatus').innerHTML += `
//               <div class="col-lg-4 mb-4">
//                 <small class="fw-medium">${ip} </small>
//                 <div class="demo-inline-spacing mt-2">
//                   <div class="text-danger">Gagal mengambil data dari perangkat.</div>
//                 </div>
//               </div>
//             `;
//           });
//         }
//         Swal.close();
//         modal.show();
//       }
//     });
//   }
  
  
//   function checkDataFromDevice(rfid, ipDestination) {
//     return fetch("access/available", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-CSRF-TOKEN": document
//           .querySelector('meta[name="csrf-token"]')
//           .getAttribute("content")
//       },
//       body: JSON.stringify({
//         rfid: rfid,
//         ip_destination: ipDestination // atau employeeNo
//       })
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Gagal mengambil data");
//         }
//         return response.json();
//       });
//   }
  
//   async function renderStatus() {
//     Swal.fire({
//       title: "Memuat data...",
//       html: "Harap tunggu sebentar",
//       allowOutsideClick: false,
//       didOpen: () => Swal.showLoading(),
//     });

//     const container = document.getElementById("contentStatusCapacity");
//     container.innerHTML = ""; // RESET

//     const fragment = document.createDocumentFragment();

//     const requests = hik.map((ip) =>
//       fetchDeviceStatus(ip)
//         .then((res) => ({ status: "fulfilled", ip, res }))
//         .catch((error) => ({ status: "rejected", ip, error }))
//     );

//     const results = await Promise.all(requests);

//     for (const result of results) {
//       if (result.status === "fulfilled") {
//         const { ip, res } = result;

//         const col = document.createElement("div");
//         col.className = "col-md-6 col-xxl-4 mb-4";
//         col.innerHTML = `
//           <div class="card h-100">
//             <div class="card-header d-flex align-items-center justify-content-between">
//               <h5 class="card-title m-0 me-2">${ip}</h5>
//             </div>
//             <div class="card-body">
//               <ul class="list-unstyled mb-0">

//                 <li class="d-flex mb-6 align-items-center">
//                   <div class="avatar flex-shrink-0 me-4">
//                     <span class="avatar-initial rounded bg-label-primary">
//                       <i class="icon-base ti tabler-user icon-lg"></i>
//                     </span>
//                   </div>
//                   <div class="row w-100 align-items-center">
//                     <div class="col-sm-8 col-xxl-8">
//                       <h6 class="mb-0">Total User</h6>
//                     </div>
//                     <div class="col-sm-4 col-xxl-4 text-end">
//                       <div class="badge ${res.capacity_user >= 5500 ? 'bg-label-danger' : 'bg-label-secondary'}">
//                         ${res.capacity_user} / 6.000
//                       </div>
//                     </div>
//                   </div>
//                 </li>

//                 <li class="d-flex mb-6 align-items-center">
//                   <div class="avatar flex-shrink-0 me-4">
//                     <span class="avatar-initial rounded bg-label-info">
//                       <i class="icon-base ti tabler-face-id icon-lg"></i>
//                     </span>
//                   </div>
//                   <div class="row w-100 align-items-center">
//                     <div class="col-sm-8 col-xxl-8">
//                       <h6 class="mb-0">Total Face</h6>
//                     </div>
//                     <div class="col-sm-4 col-xxl-4 text-end">
//                       <div class="badge ${res.capacity_face >= 5500 ? 'bg-label-danger' : 'bg-label-secondary'}">
//                         ${res.capacity_face} / 6.000
//                       </div>
//                     </div>
//                   </div>
//                 </li>

//                 <li class="d-flex mb-6 align-items-center">
//                   <div class="avatar flex-shrink-0 me-4">
//                     <span class="avatar-initial rounded bg-label-success">
//                       <i class="icon-base ti tabler-device-sd-card icon-lg"></i>
//                     </span>
//                   </div>
//                   <div class="row w-100 align-items-center">
//                     <div class="col-sm-8 col-xxl-8">
//                       <h6 class="mb-0">Total Card</h6>
//                     </div>
//                     <div class="col-sm-4 col-xxl-4 text-end">
//                       <div class="badge ${res.capacity_card >= 5500 ? 'bg-label-danger' : 'bg-label-secondary'}">
//                         ${res.capacity_card} / 6.000
//                       </div>
//                     </div>
//                   </div>
//                 </li>

//               </ul>
//             </div>
//           </div>
//         `;

//         fragment.appendChild(col);
//       } else {
//         const col = document.createElement("div");
//         col.className = "col-md-6 col-xxl-3 mb-4";
//         col.innerHTML = `
//           <div class="card h-100 border-danger">
//             <div class="card-body text-danger">
//               <strong>${result.ip}</strong><br/>
//               Gagal mengambil data perangkat
//             </div>
//           </div>
//         `;
//         fragment.appendChild(col);
//       }
//     }

//     container.appendChild(fragment);
//     Swal.close();
//   }
  
  
//   function fetchDeviceStatus(ipDestination){
//     return fetch("access/device", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-CSRF-TOKEN": document
//           .querySelector('meta[name="csrf-token"]')
//           .getAttribute("content")
//       },
//       body: JSON.stringify({
//         ip_destination: ipDestination // atau employeeNo
//       })
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Gagal mengambil data");
//         }
//         return response.json();
//       });
//   }
// });
'use strict';

const hik = [
  '192.168.20.102',
  '192.168.20.104',
  '192.168.20.106',
  '192.168.20.108',
  '192.168.20.118',
  '192.168.20.110',
  '192.168.20.112',
  '192.168.20.114',
  '192.168.20.116'
];

const DEVICE_CACHE_KEY = 'device_status_cache';
const DEVICE_CACHE_TIME_KEY = 'device_capacity_cache_time';
const DEVICE_CACHE_TTL = 5 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {

  /* ================= INITIAL ================= */
  fetch('/access/preload-rfid')
    .catch(() => {}); // silent

  renderStatus();
  setInterval(renderStatus, 5 * 60 * 1000);

  $.ajaxSetup({
    headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
  });

  /* ================= DATATABLE ================= */
  const dtAccess = document.querySelector('.datatables-access');
  if (dtAccess) {
    new DataTable(dtAccess, {
      processing: true,
      serverSide: true,
      responsive: true,
      ajax: { url: '/access/table', type: 'GET' },
      columns: [
        {
          data: null,
          render: (_, __, ___, meta) =>
            meta.row + meta.settings._iDisplayStart + 1,
          orderable: false,
          searchable: false
        },
        { data: 'number' },
        { data: 'nama_pekerja' },
        { data: 'nama_perusahaan' },
        { data: 'expire' },
        { data: 'rfid' },
        { data: 'gender' },
        {
          data: 'rfid',
          orderable: false,
          render: (rfid, _, row) => `
            <button
              class="btn btn-sm rounded-pill btn-outline-success checkData"
              data-rfid="${rfid}"
              data-photo="${row.pas_photo ?? ''}">
              <i class="icon-base ti tabler-arrow-up-right"></i>
            </button>`
        }
      ]
    });
  }

  /* ================= CLICK CHECK DATA ================= */
  document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.checkData');
  if (!btn) return;

  btn.disabled = true;
  btn.classList.add('disabled');

  const rfid = btn.dataset.rfid;
  const pas_photo = btn.dataset.photo;
  const container = document.getElementById('contentStatus');
  const modal = new bootstrap.Modal(document.getElementById('modalCheck'));

  container.innerHTML = '';

  Swal.fire({
    title: 'Memuat data...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  // FOTO TETAP
  if (pas_photo) {
    container.innerHTML += `
      <div class="col-12 mb-4 text-center">
        <img src="http://perizinanlk3.ssprimadaya.co.id/uploads/foto_pekerja/${pas_photo}"
             class="img-thumbnail"
             style="max-height:150px">
      </div>`;
  }

  try {
    const res = await fetch(`/access/available/${rfid}`);
    if (!res.ok) throw new Error('API error');

    const json = await res.json();
    const data = json.data;

    Object.entries(data).forEach(([ip, result]) => {

      if (!result.success) {
        container.innerHTML += errorCard(ip);
        return;
      }

      const user = result.response?.UserInfoSearch?.UserInfo?.[0];
      const endTime = user?.Valid?.endTime;
      const isExpire = endTime ? new Date(endTime) > new Date() : false;

      container.innerHTML += `
        <div class="col-lg-4 mb-4">
          <small class="fw-medium">${ip}</small>
          <div class="demo-inline-spacing mt-3">
            <ul class="list-group">
              ${li(true, 'Available On Device')}
              ${li(isExpire, `Expire At : ${endTime || '-'}`)}
              ${li(user?.numOfFace > 0, 'Has Face Data')}
              ${li(user?.numOfCard > 0, 'Has Card Data')}
            </ul>
          </div>
        </div>`;
    });

    container.insertAdjacentHTML('afterbegin', `
      <div class="col-12 mb-4 text-center">
        <button class="btn btn-warning btnUploadUlang" data-rfid="${rfid}">
          <i class="ti ti-refresh"></i> Input Ulang ke Device
        </button>
        <button class="btn btn-info btnReloadData" data-rfid="${rfid}">
          <i class="ti ti-refresh"></i> Reload Data
        </button>
      </div>
    `);

    Swal.close();
    modal.show();

  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('disabled');
  }
});

});

/* ================= INPUT ULANG KE DEVICE ================= */
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btnUploadUlang');
  if (!btn) return;

  const rfid = btn.dataset.rfid;
  btn.disabled = true;
  btn.innerHTML = `<i class="ti ti-loader ti-spin"></i> Processing...`;

  Swal.fire({
    title: 'Input ulang ke device',
    html: 'Sedang memproses, mohon tunggu...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const res = await fetch(
      `/access/upload-ulang/${rfid}`
    );

    if (!res.ok) throw new Error('Gagal memanggil API');

    const data = await res.json();

    Swal.close();

    renderUploadResult(data);

  } catch (err) {
    Swal.fire('Error', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="ti ti-refresh"></i> Input Ulang ke Device`;
  }
});

// Render hasil upload ulang
function renderUploadResult(data) {
  let html = '';

  Object.entries(data).forEach(([rfid, user]) => {
    console.log({ rfid, user }, 'result upload ulang');

    user.results.forEach(r => {

      // ===== STATUS DATA (CARD / USER) =====
      const dataOk =
        r.result.cardResult?.statusCode === 1 ||
        r.result.add_again_result?.statusCode === 1;

      const dataText = dataOk
        ? 'OK'
        : r.result.cardResult?.subStatusCode ||
          r.result.add_again_result?.subStatusCode ||
          'FAILED';

      // ===== STATUS FOTO (FACE) =====
      const photoOk = Array.isArray(r.result.add_again_result.faceResult) && r.result.add_again_result.faceResult.length > 0;
      const photoText = photoOk
        ? 'OK'
        : 'TIDAK ADA / GAGAL';

      // ===== BORDER CARD =====
      let cardClass = 'border-danger';
      if (dataOk && photoOk) cardClass = 'border-success';
      else if (dataOk) cardClass = 'border-warning';

      html += `
        <div class="col-lg-4 mb-3">
          <div class="card ${cardClass}">
            <div class="card-body">

              <strong>${r.device_ip}</strong>

              <!-- STATUS DATA -->
              <div class="mt-2">
                <span class="badge ${dataOk ? 'bg-success' : 'bg-danger'}">
                  📄 Data : ${dataText}
                </span>
              </div>

              <!-- STATUS FOTO -->
              <div class="mt-2">
                <span class="badge ${photoOk ? 'bg-success' : 'bg-warning'}">
                  🖼️ Foto : ${photoText}
                </span>
              </div>

            </div>
          </div>
        </div>
      `;
    });
  });

  Swal.fire({
    title: 'Hasil Input Ulang',
    html: `
      <div class="row">
        ${html}
      </div>
    `,
    width: '800px',
    confirmButtonText: 'Tutup'
  });
}

/* ================= HELPERS ================= */

function checkDataFromDevice(rfid, ip) {
  return fetch('/access/available', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute('content')
    },
    body: JSON.stringify({
      rfid,
      ip_destination: ip
    })
  }).then(res => {
    if (!res.ok) throw new Error('Device error');
    return res.json();
  });
}

// 🔁 Retry device mati
async function retryCheck(rfid, ip, retry = 2) {
  try {
    return await checkDataFromDevice(rfid, ip);
  } catch (err) {
    if (retry <= 0) throw err;
    await delay(500);
    return retryCheck(rfid, ip, retry - 1);
  }
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function li(ok, text) {
  return `
    <li class="list-group-item d-flex align-items-center">
      <span class="me-2">
        <i class="icon-base ti ${
          ok ? 'tabler-circle-check text-success' : 'tabler-xbox-x text-danger'
        }"></i>
      </span>
      ${text}
    </li>`;
}

function errorCard(ip) {
  return `
    <div class="col-lg-4 mb-4">
      <small class="fw-medium">${ip}</small>
      <div class="text-danger mt-2">
        Gagal mengambil data dari perangkat
      </div>
    </div>`;
}

function saveDeviceCache(data) {
  localStorage.setItem(DEVICE_CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(DEVICE_CACHE_TIME_KEY, Date.now());
}

function loadDeviceCache() {
  const time = localStorage.getItem(DEVICE_CACHE_TIME_KEY);
  const raw = localStorage.getItem(DEVICE_CACHE_KEY);

  if (!time || !raw) return null;
  if (Date.now() - Number(time) > DEVICE_CACHE_TTL) return null;

  return JSON.parse(raw);
}

function clearDeviceCache() {
  localStorage.removeItem(DEVICE_CACHE_KEY);
  localStorage.removeItem(DEVICE_CACHE_TIME_KEY);
}

/* ================= DEVICE CAPACITY ================= */

async function renderStatus(force = false) {
  Swal.fire({
    title: 'Memuat data...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const container = document.getElementById('contentStatusCapacity');
  container.innerHTML = '';

  // ✅ PAKAI CACHE DULU
  if (!force) {
    const cached = loadDeviceCache();
    if (cached) {
      renderDeviceCards(cached);
      Swal.close();
      return;
    }
  }

  // 🔁 FETCH SEKALI
  const results = await Promise.allSettled(
    hik.map(ip => fetchDeviceStatus(ip))
  );

  const data = hik.map((ip, i) => ({
    ip,
    result: results[i]
  }));

  saveDeviceCache(data);
  renderDeviceCards(data);
  Swal.close();
}

function renderDeviceCards(data) {
  const container = document.getElementById('contentStatusCapacity');
  const fragment = document.createDocumentFragment();

  data.forEach(({ ip, result }) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-xxl-4 mb-4';

    if (result.status !== 'fulfilled') {
      col.innerHTML = `
        <div class="card h-100 border-danger">
          <div class="card-body text-danger">
            <strong>${ip}</strong><br/>Device tidak aktif
          </div>
        </div>`;
    } else {
      const d = result.value;
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title">${ip}</h5>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mb-0">
              ${capacityItem('user', d.capacity_user)}
              ${capacityItem('face-id', d.capacity_face)}
              ${capacityItem('device-id-card', d.capacity_card)}
            </ul>
          </div>
        </div>`;
    }

    fragment.appendChild(col);
  });

  container.appendChild(fragment);
}

function fetchDeviceStatus(ip) {
  return fetch('/access/device', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute('content')
    },
    body: JSON.stringify({ ip_destination: ip })
  }).then(r => {
    if (!r.ok) throw new Error('Device error');
    return r.json();
  });
}

function capacityItem(icon, value) {
  const danger = value >= 5500 ? 'bg-label-danger' : 'bg-label-secondary';
  return `
    <li class="d-flex mb-6 align-items-center">
      <div class="avatar flex-shrink-0 me-4">
        <span class="avatar-initial rounded bg-label-primary">
          <i class="icon-base ti tabler-${icon} icon-lg"></i>
        </span>
      </div>
      <div class="row w-100 align-items-center">
        <div class="col-8">
          <h6 class="mb-0">Total ${icon.replace('-', ' ')}</h6>
        </div>
        <div class="col-4 text-end">
          <div class="badge ${danger}">
            ${value} / 6.000
          </div>
        </div>
      </div>
    </li>`;
}

document.getElementById('reloadDevice')?.addEventListener('click', () => {
  clearDeviceCache();
  renderStatus(true);
});

document.getElementById('btnReloadData')?.addEventListener('click', async () => {
  Swal.fire({ title: 'Reload data...', didOpen: () => Swal.showLoading() });

  await fetch(`/access/available/${currentRfid}?reload=1`);

  Swal.fire('OK', 'Data diperbarui', 'success');
});