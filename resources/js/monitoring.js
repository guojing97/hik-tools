"use strict";

document.addEventListener('DOMContentLoaded', function () {

    const dtMonitoring = document.querySelector('.datatables-monitoring');

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    if (!dtMonitoring) {
        return;
    }

    // INIT DATATABLES (SERVER SIDE)
    const dtMonitoringTable = new DataTable(dtMonitoring, {
        processing: true,
        serverSide: true,
        responsive: true,
        rowId: 'id', // PENTING
        ajax: {
            url: '/monitoring/table',
            type: 'POST',
        },
        order: [[0, 'desc']],
        columns: [
            { data: 'timestamp', orderable: false },
            { data: 'number' },
            { data: 'name' },
            { data: 'company' },
            { data: 'door' },
            { data: 'check' }
        ]
    });

    // SSE LISTENER
    // const source = new EventSource('/monitoring/sse');

    // source.addEventListener('history', function (event) {

    //     const payload = JSON.parse(event.data);

    //     // hanya trigger reload jika ada data baru
    //     if (payload.length > 0) {
    //         dtMonitoringTable.ajax.reload(null, false); // false = tidak reset pagination
    //     }
    // });

    // source.onerror = function () {
    //     console.error('SSE connection lost');
    // };

});
