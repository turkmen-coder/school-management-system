$max_retries = 20
$retry_interval = 5
$i = 0

while ($i -lt $max_retries) {
    try {
        $tcp = New-Object Net.Sockets.TcpClient("localhost", 5432)
        if ($tcp.Connected) {
            Write-Host "PostgreSQL is ready!"
            $tcp.Close()
            exit 0
        }
    } catch {
        Write-Host "Waiting for PostgreSQL... ($($i+1)/$max_retries)"
        Start-Sleep -Seconds $retry_interval
        $i++
    }
}

Write-Host "PostgreSQL did not become ready in time."
exit 1