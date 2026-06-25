@echo off
title Orbitrack Updater
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f=[IO.File]::ReadAllText('%~f0'); iex $f.Substring($f.LastIndexOf('#:PSCODE:#')+10)"
echo.
pause
exit /b
#:PSCODE:#
$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$repo = 'Everlasting-dev/work-tracking-dashboard'
$ua   = 'Orbitrack-Updater'

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host '        Orbitrack  -  Update Installer'    -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

# [1/3] Connection ---------------------------------------------------------
Write-Host '[1/3] Checking connection... ' -NoNewline
try {
    $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -Headers @{ 'User-Agent' = $ua } -TimeoutSec 30
} catch {
    Write-Host 'FAILED' -ForegroundColor Red
    Write-Host ("      Could not reach the update server. Check your internet connection." ) -ForegroundColor Red
    Write-Host ("      ({0})" -f $_.Exception.Message) -ForegroundColor DarkGray
    return
}
Write-Host 'OK' -ForegroundColor Green

$ver   = $rel.tag_name
$asset = $rel.assets | Where-Object { $_.name -like '*.exe' } | Select-Object -First 1
if (-not $asset) {
    Write-Host '      No installer was found in the latest release.' -ForegroundColor Red
    return
}
Write-Host ("      Latest version: {0}" -f $ver) -ForegroundColor Gray

# [2/3] Download -----------------------------------------------------------
$dest = Join-Path $env:TEMP $asset.name
Write-Host ("[2/3] Downloading {0}" -f $asset.name)
try {
    $req = [System.Net.HttpWebRequest]::Create($asset.browser_download_url)
    $req.UserAgent = $ua
    $req.AllowAutoRedirect = $true
    $resp  = $req.GetResponse()
    $total = $resp.ContentLength
    $rs    = $resp.GetResponseStream()
    $fs    = [System.IO.File]::Create($dest)
    $buf   = New-Object byte[] 1048576
    $got   = 0; $n = 0
    while (($n = $rs.Read($buf, 0, $buf.Length)) -gt 0) {
        $fs.Write($buf, 0, $n); $got += $n
        if ($total -gt 0) { $pct = [int](($got / $total) * 100) } else { $pct = 0 }
        Write-Host -NoNewline ("`r      Downloading... {0,3}%   {1,6:N1} / {2,6:N1} MB" -f $pct, ($got / 1MB), ($total / 1MB))
    }
    $fs.Close(); $rs.Close(); $resp.Close()
    Write-Host ''
    Write-Host '      Download complete.' -ForegroundColor Green
} catch {
    Write-Host ''
    Write-Host ("      Download failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
    if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }
    return
}

# [3/3] Install ------------------------------------------------------------
Write-Host '[3/3] Installing...'
try {
    $proc = Start-Process -FilePath $dest -ArgumentList '/S' -PassThru
    $p = 0
    while (-not $proc.HasExited) {
        if ($p -lt 95) { $p += 5 }
        Write-Host -NoNewline ("`r      Installing... {0,3}%" -f $p)
        Start-Sleep -Milliseconds 350
    }
    Write-Host -NoNewline "`r      Installing... 100%"
    Write-Host ''
    Write-Host '      Installation complete!' -ForegroundColor Green
} catch {
    Write-Host ''
    Write-Host ("      Install failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
    return
} finally {
    if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }
}

Write-Host ''
Write-Host ("Orbitrack has been updated to {0}." -f $ver) -ForegroundColor Cyan
