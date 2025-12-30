<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use Yajra\DataTables\DataTables;

class AccessController extends Controller
{
    public function index()
    {
        return view('content.access.index');
    }

    public function table(Request $request)
    {
        try {
            $isExpire = $request->is_expire ?? false;
            $data = DB::table('access')->select(
                'user',
                'nama_pekerja',
                'nama_perusahaan',
                'expire',
                'number',
                'rfid',
                'gender',
                'is_active'
            );

            if ($isExpire) {
                $data = $data->where('expire', '<', now());
            }

            $data = $data->get();
            return DataTables::of($data)
                ->addIndexColumn()
                ->make(true);
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . " " . $th->getFile() . " " . $th->getLine());
            return response()->json([
                "message" => "Oops! Something went wrong.",
                "status"  => false,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function checkAvailable(Request $request)
    {
        try {
            $validatedData = Validator::make($request->all(), [
                'ip_destination'  => 'required',
                'rfid'            => 'required',
            ]);

            if ($validatedData->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors'  => $validatedData->errors(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $hexaToDecimal = hexdec((int)'11' . $request->rfid);

            $response = Http::withDigestAuth('admin', 'Hik12345')->withHeaders([
                'Content-Type' => 'application/json',
            ])->post(
                $request->ip_destination . '/ISAPI/AccessControl/UserInfo/Search?format=json',
                [
                    'UserInfoSearchCond' => [
                        'searchID' => 'developer',
                        'searchResultPosition' => 0,
                        'maxResults' => 10,
                        'EmployeeNoList' => [
                            [
                                'employeeNo' => '0' . $hexaToDecimal
                            ]
                        ]
                    ]
                ]
            );

            if ($response->failed()) {
                return response()->json([
                    'message' => 'Failed to connect to the device.',
                    'error'   => $response->body()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return $response->json();
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . " " . $th->getFile() . " " . $th->getLine());
            return response()->json([
                "message" => "Oops! Something went wrong.",
                "status"  => false,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getStatusDevice(Request $request)
    {
        try {
            $validatedData = Validator::make($request->all(), [
                'ip_destination'  => 'required',
            ]);

            if ($validatedData->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors'  => $validatedData->errors(),
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $capacityCard = $this->getCapacityCard($request->ip_destination);
            $capacityUser = $this->getCapacityUser($request->ip_destination);
            $capacityFace = $this->getCapacityFDLib($request->ip_destination);

            return response()->json([
                'capacity_card' => $capacityCard,
                'capacity_user' => $capacityUser,
                'capacity_face' => $capacityFace,
            ], Response::HTTP_OK);
        } catch (\Throwable $th) {
            Log::error($th->getMessage() . " " . $th->getFile() . " " . $th->getLine());
            return response()->json([
                "message" => "Oops! Something went wrong.",
                "status"  => false,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function getCapacityCard($ip)
    {
        try {
            $response = Http::withDigestAuth('admin', 'Hik12345')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->timeout(5)
                ->get($ip . '/ISAPI/AccessControl/CardInfo/Count?format=json');

            // HTTP status bukan 2xx
            if ($response->failed()) {
                Log::error('Hikvision API failed', [
                    'ip'     => $ip,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                throw new \RuntimeException('Hikvision device returned an error response');
            }

            // Pastikan response JSON valid
            $data = $response->json();

            if (!is_array($data)) {
                Log::error('Invalid JSON response from Hikvision', [
                    'ip'   => $ip,
                    'body' => $response->body(),
                ]);

                throw new \UnexpectedValueException('Invalid JSON response from device');
            }

            // Ambil cardNumber dengan aman
            $cardNumber = data_get($data, 'CardInfoCount.cardNumber');

            if (!is_numeric($cardNumber)) {
                Log::error('cardNumber not found in Hikvision response', [
                    'ip'   => $ip,
                    'data' => $data,
                ]);

                throw new \UnexpectedValueException('cardNumber not found in device response');
            }

            return (int) $cardNumber;
        } catch (\Throwable $e) {
            Log::error('Failed to get card capacity from Hikvision', [
                'ip'      => $ip,
                'message' => $e->getMessage(),
            ]);

            // fallback aman agar aplikasi tidak crash
            return 0;
        }
    }

    private function getCapacityUser($ip)
    {
        try {
            $response = Http::withDigestAuth('admin', 'Hik12345')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->timeout(5)
                ->get($ip . '/ISAPI/AccessControl/UserInfo/Count?format=json');

            // HTTP status bukan 2xx
            if ($response->failed()) {
                Log::error('Hikvision API failed', [
                    'ip'     => $ip,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                throw new \RuntimeException('Hikvision device returned an error response');
            }

            // Pastikan response JSON valid
            $data = $response->json();

            if (!is_array($data)) {
                Log::error('Invalid JSON response from Hikvision', [
                    'ip'   => $ip,
                    'body' => $response->body(),
                ]);

                throw new \UnexpectedValueException('Invalid JSON response from device');
            }

            // Ambil cardNumber dengan aman
            $cardNumber = data_get($data, 'UserInfoCount.userNumber');

            if (!is_numeric($cardNumber)) {
                Log::error('cardNumber not found in Hikvision response', [
                    'ip'   => $ip,
                    'data' => $data,
                ]);

                throw new \UnexpectedValueException('cardNumber not found in device response');
            }

            return (int) $cardNumber;
        } catch (\Throwable $e) {
            Log::error('Failed to get card capacity from Hikvision', [
                'ip'      => $ip,
                'message' => $e->getMessage(),
            ]);

            // fallback aman agar aplikasi tidak crash
            return 0;
        }
    }

    private function getCapacityFDLib($ip)
    {
        try {
            $response = Http::withDigestAuth('admin', 'Hik12345')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->timeout(5)
                ->get($ip . '/ISAPI/Intelligent/FDLib/Count?format=json');

            // HTTP status bukan 2xx
            if ($response->failed()) {
                Log::error('Hikvision API failed', [
                    'ip'     => $ip,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                throw new \RuntimeException('Hikvision device returned an error response');
            }

            // Pastikan response JSON valid
            $data = $response->json();

            if (!is_array($data)) {
                Log::error('Invalid JSON response from Hikvision', [
                    'ip'   => $ip,
                    'body' => $response->body(),
                ]);

                throw new \UnexpectedValueException('Invalid JSON response from device');
            }

            $cardNumber = data_get($data, 'FDRecordDataInfo.0.recordDataNumber');

            if (!is_numeric($cardNumber)) {
                Log::error('cardNumber not found in Hikvision response', [
                    'ip'   => $ip,
                    'data' => $data,
                ]);

                throw new \UnexpectedValueException('cardNumber not found in device response');
            }

            return (int) $cardNumber;
        } catch (\Throwable $e) {
            Log::error('Failed to get card capacity from Hikvision', [
                'ip'      => $ip,
                'message' => $e->getMessage(),
            ]);

            // fallback aman agar aplikasi tidak crash
            return 0;
        }
    }
}
