<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class PFController extends Controller
{
    public function health()
    {
        return response()->stream(function () {
            // Disable output buffering to ensure data streams immediately
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $filePath = storage_path('app/hik_device/device.csv');
            $devices = [];

            if (file_exists($filePath)) {
                if (($handle = fopen($filePath, 'r')) !== false) {
                    // Skip header
                    fgetcsv($handle);
                    while (($data = fgetcsv($handle)) !== false) {
                        if (!empty($data[0])) {
                            $devices[] = [
                                'ip' => trim($data[0]),
                                'description' => isset($data[1]) ? trim($data[1]) : '',
                            ];
                        }
                    }
                    fclose($handle);
                }
            }

            if (empty($devices)) {
                echo "data: " . json_encode(['error' => 'No devices configured or device.csv is empty']) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
                return;
            }

            $startTime = time();
            $timeout = 120; // 2 minutes limit for each request
            $lastStatusesJson = '';

            while (true) {
                if (connection_aborted() || (time() - $startTime) >= $timeout) {
                    break;
                }

                $currentStatuses = [];

                foreach ($devices as $device) {
                    if (connection_aborted() || (time() - $startTime) >= $timeout) {
                        break 2;
                    }

                    $ip = $device['ip'];
                    $isOnline = false;
                    try {
                        $ipEscaped = escapeshellarg($ip);
                        // Send 1 ping packet with a 2-second timeout
                        exec("ping -c 1 -W 2 {$ipEscaped}", $output, $resultCode);
                        $isOnline = ($resultCode === 0);
                    } catch (\Throwable $e) {
                        $isOnline = false;
                        Log::debug("Ping failed for {$ip}", [
                            'message' => $e->getMessage()
                        ]);
                    }

                    $currentStatuses[] = [
                        'ip' => $ip,
                        'description' => $device['description'],
                        'status' => $isOnline ? 'online' : 'offline',
                    ];
                }

                $currentJson = json_encode($currentStatuses);
                if ($currentJson !== $lastStatusesJson) {
                    $lastStatusesJson = $currentJson;
                    echo "data: " . $currentJson . "\n\n";

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }

                sleep(10);
            }
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable buffering for Nginx/FastCGI compatibility
        ]);
    }
}
