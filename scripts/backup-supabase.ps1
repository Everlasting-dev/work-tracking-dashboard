param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$ServiceRoleKey,

  [string]$OutputRoot = "supabase-backups",
  [string]$Bucket = "project-files"
)

$ErrorActionPreference = "Stop"

$SupabaseUrl = $SupabaseUrl.Trim().TrimEnd("/")
$ServiceRoleKey = $ServiceRoleKey.Trim()

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path (Resolve-Path ".").Path (Join-Path $OutputRoot $timestamp)
$tablesDir = Join-Path $backupDir "tables"
$storageDir = Join-Path $backupDir "storage"
New-Item -ItemType Directory -Force -Path $tablesDir, $storageDir | Out-Null

$headers = @{
  "apikey" = $ServiceRoleKey
  "Authorization" = "Bearer $ServiceRoleKey"
}
$jsonHeaders = $headers.Clone()
$jsonHeaders["Accept"] = "application/json"

$tables = @(
  "wt_users",
  "wt_classrooms",
  "wt_user_classrooms",
  "wt_departments",
  "wt_settings",
  "wt_projects",
  "wt_milestones",
  "wt_tasks",
  "wt_updates",
  "wt_attachments",
  "wt_activity_log",
  "wt_notifications",
  "wt_project_access_requests",
  "wt_bug_reports",
  "wt_webhooks",
  "wt_sessions",
  "wt_workflow_templates",
  "wt_user_favorites",
  "wt_personal_notes",
  "wt_direct_messages",
  "wt_discord_messages"
)

try {
  $probe = Invoke-RestMethod -Method Get `
    -Uri "$SupabaseUrl/rest/v1/wt_users?select=id&limit=1" `
    -Headers @{ apikey = $ServiceRoleKey; Authorization = "Bearer $ServiceRoleKey"; Accept = "application/json" }
  Write-Host "Supabase REST probe ok: wt_users is reachable."
} catch {
  $status = $null
  try { $status = [int]$_.Exception.Response.StatusCode } catch {}
  throw "Supabase REST probe failed before backup started (HTTP $status). Re-copy the service-role key as one line, confirm the project URL, and rotate the exposed key after this backup. Details: $($_.Exception.Message)"
}

function Invoke-SupabaseGetJson {
  param([string]$Path)
  $uri = "$SupabaseUrl$Path"
  Invoke-RestMethod -Method Get -Uri $uri -Headers $jsonHeaders
}

function Join-Headers {
  param([hashtable]$Base, [hashtable]$Extra)
  $merged = @{}
  foreach ($key in $Base.Keys) { $merged[$key] = $Base[$key] }
  foreach ($key in $Extra.Keys) { $merged[$key] = $Extra[$key] }
  return $merged
}

function Get-Sha256 {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

$manifest = [ordered]@{
  createdAt = (Get-Date).ToUniversalTime().ToString("o")
  supabaseUrl = $SupabaseUrl
  bucket = $Bucket
  tables = @{}
  storage = @()
  warnings = @()
}

foreach ($table in $tables) {
  try {
    $rows = Invoke-SupabaseGetJson "/rest/v1/${table}?select=*"
    if ($null -eq $rows) { $rows = @() }
    if ($rows -isnot [array]) { $rows = @($rows) }
    $path = Join-Path $tablesDir "$table.json"
    ConvertTo-Json -InputObject $rows -Depth 100 | Set-Content -Encoding utf8 -LiteralPath $path
    $manifest.tables[$table] = @{
      rows = $rows.Count
      file = "tables/$table.json"
      sha256 = Get-Sha256 $path
    }
    Write-Host "Backed up $table ($($rows.Count) rows)"
  } catch {
    $manifest.warnings += "Table $table failed: $($_.Exception.Message)"
    Write-Warning "Table $table failed: $($_.Exception.Message)"
  }
}

function Backup-StoragePrefix {
  param([string]$Prefix = "")

  $body = @{
    limit = 1000
    offset = 0
    prefix = $Prefix
    sortBy = @{ column = "name"; order = "asc" }
  } | ConvertTo-Json -Depth 10

  $objects = Invoke-RestMethod -Method Post `
    -Uri "$SupabaseUrl/storage/v1/object/list/$Bucket" `
    -Headers (Join-Headers $headers @{ "Content-Type" = "application/json" }) `
    -Body $body

  foreach ($object in @($objects)) {
    if (-not $object.name) { continue }
    $relative = if ($Prefix) { "$Prefix/$($object.name)" } else { $object.name }
    if ($null -eq $object.id -and $null -eq $object.metadata) {
      Backup-StoragePrefix -Prefix $relative
      continue
    }
    $dest = Join-Path $storageDir $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    Invoke-WebRequest -Method Get `
      -Uri "$SupabaseUrl/storage/v1/object/$Bucket/$relative" `
      -Headers $headers `
      -OutFile $dest
    $manifest.storage += @{
      path = $relative
      size = (Get-Item -LiteralPath $dest).Length
      sha256 = Get-Sha256 $dest
    }
    Write-Host "Backed up storage/$relative"
  }
}

try {
  Backup-StoragePrefix
} catch {
  $manifest.warnings += "Storage backup failed: $($_.Exception.Message)"
  Write-Warning "Storage backup failed: $($_.Exception.Message)"
}

Copy-Item -LiteralPath "supabase/schema.sql" -Destination (Join-Path $backupDir "schema_legacy.sql") -Force
if (Test-Path "supabase/schema_v3.sql") {
  Copy-Item -LiteralPath "supabase/schema_v3.sql" -Destination (Join-Path $backupDir "schema_v3.sql") -Force
}

$manifestPath = Join-Path $backupDir "manifest.json"
$manifest | ConvertTo-Json -Depth 100 | Set-Content -Encoding utf8 -LiteralPath $manifestPath

$tableCount = $manifest.tables.Count
$warningCount = $manifest.warnings.Count

@"
WorkTracker Supabase backup
Created: $($manifest.createdAt)
Tables: $tableCount
Storage files: $($manifest.storage.Count)
Warnings: $warningCount

Restore rule:
- Verify manifest checksums before import.
- Restore into staging first.
- Do not drop production tables until staging row counts and document checks pass.
"@ | Set-Content -Encoding utf8 -LiteralPath (Join-Path $backupDir "RESTORE_NOTES.txt")

if ($tableCount -eq 0) {
  Write-Error "No Supabase tables were backed up. Storage files may be present, but this is NOT a complete backup. Check the Supabase URL, service-role key, and whether the legacy wt_* tables exist in the public schema."
}

Write-Host "Backup complete: $backupDir"
