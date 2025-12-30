<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Yajra\DataTables\DataTables;

class AccessController extends Controller
{
    private string $hikUser = 'admin';
    private string $hikPass = 'Hik12345';
    private int $timeout = 3;

    /* ===============================
     * VIEW
     * =============================== */
    public function index()
    {
        return view('content.access.index');
    }

    /* ===============================
     * DATATABLE
     * =============================== */
    // public function table(Request $request)
    // {
    //     try {
    //         $query = DB::table('access')->select(
    //             'user',
    //             'nama_pekerja',
    //             'nama_perusahaan',
    //             'expire',
    //             'number',
    //             'rfid',
    //             'gender',
    //             'pas_photo',
    //             'is_active'
    //         );

    //         if ($request->boolean('is_expire')) {
    //             $query->where('expire', '<', now());
    //         }

    //         return DataTables::of($query)
    //             ->addIndexColumn()
    //             ->make(true);

    //     } catch (\Throwable $th) {
    //         Log::error('Access table error', [
    //             'msg' => $th->getMessage(),
    //             'line' => $th->getLine(),
    //         ]);

    //         return response()->json([
    //             "message" => "Oops! Something went wrong.",
    //             "status"  => false,
    //         ], Response::HTTP_INTERNAL_SERVER_ERROR);
    //     }
    // }

    public function table(Request $request)
{
    try {

        // 🔑 cache key berdasarkan parameter DataTables
        $cacheKey = 'access_table:' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {

            $query = DB::table('access')->select(
                'user',
                'nama_pekerja',
                'nama_perusahaan',
                'expire',
                'number',
                'rfid',
                'gender',
                'pas_photo',
                'is_active'
            );

            if ($request->boolean('is_expire')) {
                $query->where('expire', '<', now());
            }

            return DataTables::of($query)
                ->addIndexColumn()
                ->make(true);
        });

    } catch (\Throwable $th) {

        Log::error('Access table error', [
            'msg'  => $th->getMessage(),
            'line' => $th->getLine()
        ]);

        return response()->json([
            'status'  => false,
            'message' => 'Oops! Something went wrong'
        ], 500);
    }
}

    /* ===============================
     * CHECK AVAILABLE (SAME PARAM)
     * =============================== */
    public function checkAvailable(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ip_destination' => 'required',
            'rfid'           => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $employeeNo = '0' . hexdec('11' . $request->rfid);

            return $this->hikvisionRequest(
                $request->ip_destination,
                '/ISAPI/AccessControl/UserInfo/Search?format=json',
                'POST',
                [
                    'UserInfoSearchCond' => [
                        'searchID' => 'developer',
                        'searchResultPosition' => 0,
                        'maxResults' => 10,
                        'EmployeeNoList' => [
                            ['employeeNo' => $employeeNo]
                        ]
                    ]
                ]
            );
        } catch (\Throwable $th) {
            Log::error('checkAvailable failed', [
                'ip' => $request->ip_destination,
                'msg' => $th->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to connect to the device.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /* ===============================
     * STATUS DEVICE (SAME PARAM)
     * =============================== */
    public function getStatusDevice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ip_destination' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $ip = $request->ip_destination;

            return response()->json([
                'capacity_card' => $this->getCapacityCard($ip),
                'capacity_user' => $this->getCapacityUser($ip),
                'capacity_face' => $this->getCapacityFDLib($ip),
            ], Response::HTTP_OK);

        } catch (\Throwable $th) {
            Log::error('getStatusDevice failed', [
                'ip' => $request->ip_destination,
                'msg' => $th->getMessage()
            ]);

            return response()->json([
                "message" => "Oops! Something went wrong.",
                "status"  => false,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /* ===============================
     * CAPACITY CARD (SAME FUNC)
     * =============================== */
    private function getCapacityCard($ip)
    {
        return $this->getCapacity(
            $ip,
            '/ISAPI/AccessControl/CardInfo/Count?format=json',
            'CardInfoCount.cardNumber'
        );
    }

    /* ===============================
     * CAPACITY USER (SAME FUNC)
     * =============================== */
    private function getCapacityUser($ip)
    {
        return $this->getCapacity(
            $ip,
            '/ISAPI/AccessControl/UserInfo/Count?format=json',
            'UserInfoCount.userNumber'
        );
    }

    /* ===============================
     * CAPACITY FACE (SAME FUNC)
     * =============================== */
    private function getCapacityFDLib($ip)
    {
        return $this->getCapacity(
            $ip,
            '/ISAPI/Intelligent/FDLib/Count?format=json',
            'FDRecordDataInfo.0.recordDataNumber'
        );
    }

    /* ===============================
     * GENERIC CAPACITY HANDLER
     * =============================== */
    private function getCapacity(string $ip, string $endpoint, string $jsonPath): int
    {
        try {
            $response = $this->hikvisionRequest($ip, $endpoint);

            return (int) data_get($response, $jsonPath, 0);
        } catch (\Throwable $th) {
            Log::warning('Capacity fetch failed', [
                'ip' => $ip,
                'endpoint' => $endpoint,
                'msg' => $th->getMessage()
            ]);
            return 0;
        }
    }

    /* ===============================
     * HIKVISION HTTP HELPER (CORE)
     * =============================== */
    private function hikvisionRequest(
        string $ip,
        string $endpoint,
        string $method = 'GET',
        array $payload = []
    ): array {
        $http = Http::withDigestAuth($this->hikUser, $this->hikPass)
            ->timeout($this->timeout)
            ->retry(1, 200)
            ->acceptJson();

        $response = $method === 'POST'
            ? $http->post($ip . $endpoint, $payload)
            : $http->get($ip . $endpoint);

        if ($response->failed()) {
            throw new \RuntimeException(
                "Hikvision API error {$response->status()}"
            );
        }

        return $response->json();
    }

    public function uploadUlang($rfid)
{
    try {
        $response = Http::timeout(60)->get(
            "http://192.168.0.3/dev/hik/uploadUserGF_byRfid_lebih_dari_satu",
            ['rfid' => $rfid]
        );

        return response()->json($response->json());

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Gagal upload ulang',
            'error'   => $e->getMessage()
        ], 500);
    }
}

}
