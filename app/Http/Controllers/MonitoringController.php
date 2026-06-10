<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Yajra\DataTables\DataTables;

class MonitoringController extends Controller
{
    public function index()
    {
        return view('content.monitoring.index');
    }

    public function table()
    {
        try {
            $query = DB::table('integrasi_iacs.history as h')
                ->select(
                    'h.id',
                    'h.timestamp',
                    'h.check',
                    'h.type',
                    'd.name as door',
                    'a.nama_perusahaan as company',
                    'a.nama_pekerja as name',
                    'a.number'
                )
                ->leftJoin('integrasi_iacs.access as a', 'h.access', '=', 'a.id')
                ->leftJoin('integrasi_iacs.doors as d', 'h.door', '=', 'd.id')
                ->orderBy('h.timestamp', 'desc');

            return DataTables::of($query)
                ->addIndexColumn()
                ->make(true);
        } catch (\Throwable $th) {
            Log::error('Datatable history error', [
                'message' => $th->getMessage(),
                'file'    => $th->getFile(),
                'line'    => $th->getLine(),
            ]);

            return response()->json([
                'message' => 'Oops! Something went wrong.',
                'status'  => false,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function sseHistory()
    {
        return response()->stream(function () {

            // ambil ID terakhir saat koneksi dibuka
            $lastId = DB::table('integrasi_iacs.history')->max('id') ?? 0;

            while (true) {

                if (connection_aborted()) {
                    break;
                }

                try {
                    $rows = DB::table('integrasi_iacs.history as h')
                        ->select(
                            'h.id',
                            'h.timestamp',
                            'h.check',
                            'h.type',
                            'd.name as door',
                            'a.nama_perusahaan as company',
                            'a.nama_pekerja as name',
                            'a.number'
                        )
                        ->leftJoin('integrasi_iacs.access as a', 'h.access', '=', 'a.id')
                        ->leftJoin('integrasi_iacs.doors as d', 'h.door', '=', 'd.id')
                        ->where('h.id', '>', $lastId)
                        ->orderBy('h.id', 'asc')
                        ->limit(10)
                        ->get();

                    if ($rows->isNotEmpty()) {

                        $lastId = $rows->last()->id;

                        echo "event: history\n";
                        echo "data: " . json_encode($rows) . "\n\n";

                        ob_flush();
                        flush();
                    }
                } catch (\Throwable $e) {
                    Log::error('SSE history error', [
                        'message' => $e->getMessage()
                    ]);
                }

                sleep(4);
            }
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
        ]);
    }
}
