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

            $devicesString = config('services.hikvision.devices', '');
            $devices = array_filter(array_map('trim', explode(',', $devicesString)));

            if (empty($devices)) {
                echo "data: " . json_encode(['error' => 'No devices configured']) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
                return;
            }

            $startTime = time();
            $timeout = 120; // 2 minutes limit for each request
            $lastStatus = [];

            while (true) {
                if (connection_aborted() || (time() - $startTime) >= $timeout) {
                    break;
                }

                foreach ($devices as $ip) {
                    if (connection_aborted() || (time() - $startTime) >= $timeout) {
                        break 2;
                    }

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

                    // Only send data if status changed or it's the first run
                    if (!isset($lastStatus[$ip]) || $lastStatus[$ip] !== $isOnline) {
                        $lastStatus[$ip] = $isOnline;
                        echo json_encode([
                            'ip' => $ip,
                            'status' => $isOnline ? 'online' : 'offline',
                        ]) . "\n\n";

                        if (ob_get_level() > 0) {
                            ob_flush();
                        }
                        flush();
                    }
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
