@php
  $configData = Helper::appClasses();
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Access')

@section('vendor-style')
  @vite(['resources/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.scss', 'resources/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.scss', 'resources/assets/vendor/libs/@form-validation/form-validation.scss', 'resources/assets/vendor/libs/sweetalert2/sweetalert2.scss', 'resources/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.scss'])
@endsection

@section('vendor-script')
  @vite(['resources/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/popular.js', 'resources/assets/vendor/libs/@form-validation/bootstrap5.js', 'resources/assets/vendor/libs/@form-validation/auto-focus.js', 'resources/assets/vendor/libs/sweetalert2/sweetalert2.js'])
@endsection

@section('page-style')
  @vite('resources/assets/vendor/scss/pages/cards-advance.scss')
@endsection

@section('page-script')
  @vite(['resources/assets/js/access.js'])
@endsection


@section('content')
  <h4>Access</h4>

  <p class="mb-6">
    A role provided access to predefined menus and features so that depending on <br />
    assigned role an administrator can have access to what user needs.
  </p>

  <div class="row g-6">
    <div class="col-12">
      <div class="row mb-4">
        <div id="contentStatusCapacity" class="row">
        </div>
      </div>
      <!-- Modal Check Data -->
      <div class="modal fade" id="modalCheck" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalCenterTitle">Data Checklist</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row" id="contentStatus">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Table -->
      <div class="card">
        <div class="card-header border-bottom">
          <h5 class="card-title mb-0">Access Filter Data</h5>
          <div class="d-flex justify-content-between align-items-end row pt-4 gap-4 gap-md-0">
            <div class="col-lg-4 col-md-6 mb-3">
              <label for="defaultSelect" class="form-label">Status</label>
              <select id="status" class="form-select">
                <option value="">Pilih Status</option>
                <option value="true">Expired</option>
                <option value="false">Non Expired</option>
              </select>
            </div>
            <div class="col-lg-4 col-md-6 mb-3">
              <label for="defaultSelect" class="form-label">Perusahaan</label>
              <select id="company" class="form-select">
                <option>Pilih Perusahaan</option>
              </select>
            </div>

            <div class="col-lg-4 col-md-6 mb-3">
              <button class="btn btn-primary w-100 w-md-auto" id="btnFilter">
                <span class="icon-xs icon-base ti tabler-filter me-2"></span> Filter
              </button>
            </div>
          </div>
        </div>
        <div class="card-datatable table-responsive pt-0">
          <table class="datatables-access table border-top">
            <thead>
              <tr>
                <th>#</th>
                <th>Number</th>
                <th>Name</th>
                <th>Company</th>
                <th>Expire</th>
                <th>RFID</th>
                <th>Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

    </div>
  </div>
@endsection
