<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class HikvisionUpdateEndTime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hikvision:update-endtime 
                            {endTime : End time (ex: 2030-12-31T23:59:59)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update endTime user Hikvision (multiple employee & device)';


    /**
     * Execute the console command.
     */
    public function handle()
    {
        $username = config('services.hikvision.username');
        $password = config('services.hikvision.password');
        $devices  = explode(',', config('services.hikvision.devices'));

        $endTime = $this->argument('endTime');

        /**
         * Contoh sumber employee
         * Bisa diganti dari DB
         */
        $employees = $this->getEmployees();

        foreach ($devices as $ip) {
            foreach ($employees as $employeeNo) {
                $generatedEmployeeNo = $this->generateEmployeeNo($employeeNo);
                $payload = [
                    'UserInfo' => [
                        'employeeNo' => $generatedEmployeeNo,
                        'Valid' => [
                            'enable'    => true,
                            'beginTime' => '2020-01-01T00:00:00',
                            'endTime'  => $endTime,
                            'timeType' => 'local'
                        ]
                    ]
                ];

                $this->info("Employee {$employeeNo} → {$generatedEmployeeNo}");

                try {
                    $response = Http::withDigestAuth($username, $password)->withHeaders([
                        'Content-Type' => 'application/json',
                    ])
                        ->timeout(10)
                        ->put(
                            "http://{$ip}/ISAPI/AccessControl/UserInfo/Modify?format=json",
                            $payload
                        );

                    if ($response->successful()) {
                        $this->info("✔ {$ip} | {$employeeNo} updated");
                    } else {
                        $this->error("✖ {$ip} | {$employeeNo} failed");
                        $this->line($response->body());
                    }
                } catch (\Throwable $e) {
                    $this->error("⚠ {$ip} | {$employeeNo} error: {$e->getMessage()}");
                }
            }
        }

        return Command::SUCCESS;
    }

    protected function getEmployees(): array
    {
        // OPSI 1: Hardcode
        // return ['EMP001', 'EMP002'];

        // OPSI 2: Dari database
        // return \App\Models\Employee::pluck('employee_no')->toArray();

        // OPSI 3: Dari file
        return array_filter(array_map('trim', file(storage_path('employees.txt'))));
    }

    protected function generateEmployeeNo(string $employeeNo)
    {
        // Step 1: gabungkan '11' + employeeNo
        $combined = '11' . $employeeNo;

        // Step 2: konversi ke hexadecimal
        $hex = hexdec($combined);

        // Step 3: tambahkan prefix '0'
        return '0' . $hex;
    }
}
