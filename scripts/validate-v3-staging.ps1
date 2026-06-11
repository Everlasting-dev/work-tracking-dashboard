param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$ServiceRoleKey
)

$ErrorActionPreference = "Stop"

$SupabaseUrl = $SupabaseUrl.Trim().TrimEnd("/")
$ServiceRoleKey = $ServiceRoleKey.Trim()

$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  Accept = "application/json"
  Prefer = "count=exact"
}

$expected = [ordered]@{
  profiles = 6
  workspaces = 1
  workspace_members = 6
  projects = 16
  project_members = 22
  tasks = 80
  project_updates = 1
  documents = 25
  notifications = 21
  activity_log = 560
}

Write-Host "Validating v3 staging row counts..."
$failed = $false

foreach ($table in $expected.Keys) {
  $uri = "$SupabaseUrl/rest/v1/${table}?select=*"
  $response = Invoke-WebRequest -Method Get -Uri $uri -Headers $headers
  $range = $response.Headers["Content-Range"]
  $count = 0
  if ($range -match "/(\d+)$") { $count = [int]$Matches[1] }
  $ok = $count -eq $expected[$table]
  if (-not $ok) { $failed = $true }
  [pscustomobject]@{
    Table = $table
    Expected = $expected[$table]
    Actual = $count
    OK = $ok
  }
}

Write-Host ""
Write-Host "Checking document storage references..."
$documents = Invoke-RestMethod -Method Get -Uri "$SupabaseUrl/rest/v1/documents?select=id,storage_path" -Headers @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  Accept = "application/json"
}

$missing = @()
foreach ($doc in @($documents)) {
  if (-not $doc.storage_path) {
    $missing += [pscustomobject]@{ id = $doc.id; storage_path = ""; reason = "empty path" }
    continue
  }
  $escaped = [uri]::EscapeUriString($doc.storage_path)
  $objectUri = "$SupabaseUrl/storage/v1/object/worktracker-documents/$escaped"
  try {
    Invoke-WebRequest -Method Head -Uri $objectUri -Headers @{
      apikey = $ServiceRoleKey
      Authorization = "Bearer $ServiceRoleKey"
    } | Out-Null
  } catch {
    $missing += [pscustomobject]@{ id = $doc.id; storage_path = $doc.storage_path; reason = $_.Exception.Message }
  }
}

if ($missing.Count) {
  $failed = $true
  Write-Warning "Missing storage files:"
  $missing | Format-Table -AutoSize
} else {
  Write-Host "All document storage references resolved."
}

if ($failed) {
  Write-Error "v3 staging validation failed."
}

Write-Host "v3 staging validation passed."
