'use strict';

var hik=[
  '192.168.20.102', // Masuk
  '192.168.20.104', // Masuk
  '192.168.20.106', // Masuk
  '192.168.20.108', // Masuk
  '192.168.20.118', // Masuk
  '192.168.20.110', // Keluar
  '192.168.20.112', // Keluar
  '192.168.20.114', // Keluar
  '192.168.20.116'  // Keluar
];

document.addEventListener('DOMContentLoaded', function (e) {
  renderStatus();
  setInterval(() => {
    renderStatus();
  }, 5 * 60 * 1000);
  const dtAccess = document.querySelector('.datatables-access')

  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  if(dtAccess){
    const dtAccessTable = new DataTable(dtAccess, {
      processing: true,
      serverSide: true,
      responsive: true,
      ajax:{
        url: '/access/table',
        type: 'GET',
      },
      columns:[
        {
          data: null,
          render: function (data, type, row, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
          },
          orderable: false,
          searchable: false,
        },
        {data: 'number'},
        {data: 'nama_pekerja'},
        {data: 'nama_perusahaan'},
        {data: 'expire'},
        {data: 'rfid'},
        {data: 'gender'},
        {
          data: 'rfid', orderable: false, render: function (data, type, row) {
            return `<div class="d-flex align-items-center"><button type="button" class="btn btn-sm rounded-pill btn-outline-success checkData me-2" data-rfid="${data}"><i class="icon-base ti tabler-arrow-up-right"></i></button></div>`;
          }
        }
      ]
    })

    document.addEventListener("click",async function (e) {
      if (e.target.closest(".checkData")) {
        document.getElementById('contentStatus').innerHTML = '';
        const modal = new bootstrap.Modal(document.getElementById('modalCheck'));
        const rfid = e.target.closest(".checkData").dataset.rfid;
        // const user = e.target.closest(".btn-check").dataset.id;

        Swal.fire({
          title: "Memuat data...",
          html: "Harap tunggu sebentar",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        for(const ip of hik){
          await checkDataFromDevice(rfid, ip).then((res) => {
            const endTime = res?.UserInfoSearch?.UserInfo?.[0]?.Valid?.endTime;
            const isExpire = endTime ? new Date(endTime) > new Date() : false;
            document.getElementById('contentStatus').innerHTML += `
             <div class="col-lg-4 mb-4">
                <small class="fw-medium">${ip}</small>
                <div class="demo-inline-spacing mt-4">
                  <ul class="list-group">
                    <li class="list-group-item d-flex align-items-center">
                      ${res.UserInfoSearch?.responseStatusStrg === "OK" ? ` <span class="me-2"><i
                      class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
                      class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
                      Available On Device
                    </li>
                    <li class="list-group-item d-flex align-items-center">
                      ${isExpire ?` <span class="me-2"><i
                      class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
                      class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
                      Expire At : ${endTime || '-'}
                    </li>
                    <li class="list-group-item d-flex align-items-center">
                      ${res?.UserInfoSearch?.UserInfo?.[0]?.numOfFace > 0 ? ` <span class="me-2"><i
                      class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
                      class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
                      Has Face Data
                    </li>
                    <li class="list-group-item d-flex align-items-center">
                      ${res?.UserInfoSearch?.UserInfo?.[0]?.numOfCard > 0 ? ` <span class="me-2"><i
                      class="icon-base ti tabler-circle-check text-success"></i></span>` : ` <span class="me-2"><i
                      class="icon-base ti tabler-xbox-x text-danger"></i></span>`}
                      Has Card Data
                    </li>
                  </ul>
                </div>
              </div>
            `;
          }).catch((err) => {
            console.error(err);
            document.getElementById('contentStatus').innerHTML += `
              <div class="col-lg-4 mb-4">
                <small class="fw-medium">${ip} </small>
                <div class="demo-inline-spacing mt-2">
                  <div class="text-danger">Gagal mengambil data dari perangkat.</div>
                </div>
              </div>
            `;
          });
        }
        Swal.close();
        modal.show();
      }
    });
  }
  
  
  function checkDataFromDevice(rfid, ipDestination) {
    return fetch("access/available", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document
          .querySelector('meta[name="csrf-token"]')
          .getAttribute("content")
      },
      body: JSON.stringify({
        rfid: rfid,
        ip_destination: ipDestination // atau employeeNo
      })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }
        return response.json();
      });
  }
  
  async function renderStatus() {
    Swal.fire({
      title: "Memuat data...",
      html: "Harap tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const container = document.getElementById("contentStatusCapacity");
    container.innerHTML = ""; // RESET

    const fragment = document.createDocumentFragment();

    const requests = hik.map((ip) =>
      fetchDeviceStatus(ip)
        .then((res) => ({ status: "fulfilled", ip, res }))
        .catch((error) => ({ status: "rejected", ip, error }))
    );

    const results = await Promise.all(requests);

    for (const result of results) {
      if (result.status === "fulfilled") {
        const { ip, res } = result;

        const col = document.createElement("div");
        col.className = "col-md-6 col-xxl-4 mb-4";
        col.innerHTML = `
          <div class="card h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h5 class="card-title m-0 me-2">${ip}</h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled mb-0">

                <li class="d-flex mb-6 align-items-center">
                  <div class="avatar flex-shrink-0 me-4">
                    <span class="avatar-initial rounded bg-label-primary">
                      <i class="icon-base ti tabler-user icon-lg"></i>
                    </span>
                  </div>
                  <div class="row w-100 align-items-center">
                    <div class="col-sm-8 col-xxl-8">
                      <h6 class="mb-0">Total User</h6>
                    </div>
                    <div class="col-sm-4 col-xxl-4 text-end">
                      <div class="badge ${res.capacity_user >= 5500 ? 'bg-label-danger' : 'bg-label-secondary'}">
                        ${res.capacity_user} / 6.000
                      </div>
                    </div>
                  </div>
                </li>

                <li class="d-flex mb-6 align-items-center">
                  <div class="avatar flex-shrink-0 me-4">
                    <span class="avatar-initial rounded bg-label-info">
                      <i class="icon-base ti tabler-face-id icon-lg"></i>
                    </span>
                  </div>
                  <div class="row w-100 align-items-center">
                    <div class="col-sm-8 col-xxl-8">
                      <h6 class="mb-0">Total Face</h6>
                    </div>
                    <div class="col-sm-4 col-xxl-4 text-end">
                      <div class="badge ${res.capacity_face >= 5500 ? 'bg-label-danger' : 'bg-label-secondary'}">
                        ${res.capacity_face} / 6.000
                      </div>
                    </div>
                  </div>
                </li>

                <li class="d-flex mb-6 align-items-center">
                  <div class="avatar flex-shrink-0 me-4">
                    <span class="avatar-initial rounded bg-label-success">
                      <i class="icon-base ti tabler-device-sd-card icon-lg"></i>
                    </span>
                  </div>
                  <div class="row w-100 align-items-center">
                    <div class="col-sm-8 col-xxl-8">
                      <h6 class="mb-0">Total Card</h6>
                    </div>
                    <div class="col-sm-4 col-xxl-4 text-end">
                      <div class="badge ${res.capacity_card >= 5500 ? 'bg-label-danger' : 'bg-label-secondary'}">
                        ${res.capacity_card} / 6.000
                      </div>
                    </div>
                  </div>
                </li>

              </ul>
            </div>
          </div>
        `;

        fragment.appendChild(col);
      } else {
        const col = document.createElement("div");
        col.className = "col-md-6 col-xxl-3 mb-4";
        col.innerHTML = `
          <div class="card h-100 border-danger">
            <div class="card-body text-danger">
              <strong>${result.ip}</strong><br/>
              Gagal mengambil data perangkat
            </div>
          </div>
        `;
        fragment.appendChild(col);
      }
    }

    container.appendChild(fragment);
    Swal.close();
  }
  
  
  function fetchDeviceStatus(ipDestination){
    return fetch("access/device", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document
          .querySelector('meta[name="csrf-token"]')
          .getAttribute("content")
      },
      body: JSON.stringify({
        ip_destination: ipDestination // atau employeeNo
      })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data");
        }
        return response.json();
      });
  }
});
