param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$ServiceRoleKey,

  [string]$BackupDir = "supabase-backups/20260609-102436",
  [string]$TempPassword = "ChangeMe-WorkTracker-2026!",
  [string]$WorkspaceId = "00000000-0000-0000-0000-000000000001",
  [string]$Bucket = "worktracker-documents",
  [switch]$ClearExisting
)

$ErrorActionPreference = "Stop"

$SupabaseUrl = $SupabaseUrl.Trim().TrimEnd("/")
$ServiceRoleKey = $ServiceRoleKey.Trim()
$BackupDir = (Resolve-Path -LiteralPath $BackupDir).Path
$TablesDir = Join-Path $BackupDir "tables"
$StorageDir = Join-Path $BackupDir "storage"

$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
}
$jsonHeaders = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  Accept = "application/json"
  "Content-Type" = "application/json"
  Prefer = "return=representation"
}

function Read-BackupJson {
  param([string]$Name)
  $path = Join-Path $TablesDir "$Name.json"
  if (-not (Test-Path -LiteralPath $path)) { return @() }
  $raw = Get-Content -LiteralPath $path -Raw
  if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
  $data = $raw | ConvertFrom-Json
  if ($null -eq $data) { return @() }
  if ($data.PSObject.Properties.Name -contains "value" -and $data.value -is [array]) { return @($data.value) }
  if ($data -is [array]) { return $data }
  return @($data)
}

function Invoke-Json {
  param(
    [ValidateSet("Get", "Post", "Patch", "Delete")]
    [string]$Method,
    [string]$Path,
    $Body = $null,
    [hashtable]$ExtraHeaders = @{}
  )
  $h = @{}
  foreach ($key in $jsonHeaders.Keys) { $h[$key] = $jsonHeaders[$key] }
  foreach ($key in $ExtraHeaders.Keys) { $h[$key] = $ExtraHeaders[$key] }
  $uri = "$SupabaseUrl$Path"
  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $h
  }
  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $h -Body ($Body | ConvertTo-Json -Depth 100)
}

function Post-Rows {
  param([string]$Table, [array]$Rows)
  if (-not $Rows -or $Rows.Count -eq 0) {
    Write-Host "Skipped $Table (0 rows)"
    return @()
  }
  $all = @()
  for ($i = 0; $i -lt $Rows.Count; $i += 200) {
    $slice = @($Rows[$i..([Math]::Min($i + 199, $Rows.Count - 1))])
    try {
      $result = Invoke-Json -Method Post -Path "/rest/v1/${Table}" -Body $slice
      if ($result) { $all += @($result) }
    } catch {
      $batchDetail = ""
      try {
        $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        $batchDetail = $reader.ReadToEnd()
      } catch {}
      Write-Warning "Batch import failed for $Table rows $i-$([Math]::Min($i + 199, $Rows.Count - 1)); retrying one row at a time. $batchDetail"
      foreach ($row in $slice) {
        try {
          $result = Invoke-Json -Method Post -Path "/rest/v1/${Table}" -Body @($row)
          if ($result) { $all += @($result) }
        } catch {
          $detail = ""
          try {
            $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
            $detail = $reader.ReadToEnd()
          } catch {}
          $summary = ""
          try { $summary = ($row | ConvertTo-Json -Depth 8 -Compress).Substring(0, [Math]::Min(240, ($row | ConvertTo-Json -Depth 8 -Compress).Length)) } catch {}
          Write-Warning "Skipped one $Table row. $($_.Exception.Message) $detail $summary"
        }
      }
    }
  }
  Write-Host "Imported $Table ($($all.Count)/$($Rows.Count) rows)"
  return $all
}

function New-MigrationEmail {
  param($User)
  $email = [string]($User.email)
  if ($email -and $email.Contains("@")) { return $email.Trim().ToLowerInvariant() }
  $username = ([string]$User.username).Trim().ToLowerInvariant() -replace "[^a-z0-9._-]", ""
  if (-not $username) { $username = "user$($User.id)" }
  return "$username@worktracker-migration.local"
}

function New-AuthUser {
  param($User)
  $email = New-MigrationEmail $User
  if ($script:ExistingAuthByEmail.ContainsKey($email)) {
    return @{
      id = $script:ExistingAuthByEmail[$email].id
      email = $email
      created = $false
    }
  }
  $body = @{
    email = $email
    password = $TempPassword
    email_confirm = $true
    user_metadata = @{
      legacy_user_id = $User.id
      username = $User.username
      display_name = if ($User.displayName) { $User.displayName } else { $User.username }
    }
  }
  try {
    $created = Invoke-Json -Method Post -Path "/auth/v1/admin/users" -Body $body
    $script:ExistingAuthByEmail[$email] = $created
    return @{
      id = $created.id
      email = $email
      created = $true
    }
  } catch {
    $detail = ""
    try {
      $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
      $detail = $reader.ReadToEnd()
    } catch {}
    throw "Could not create Auth user '$email'. Use a fresh staging project or delete existing staging Auth users. Details: $($_.Exception.Message) $detail"
  }
}

function Map-StatusProject {
  param([string]$Status)
  if (@("active", "paused", "completed", "archived") -contains $Status) { return $Status }
  return "active"
}

function Map-Priority {
  param([string]$Priority)
  if (@("low", "medium", "high", "urgent") -contains $Priority) { return $Priority }
  return "medium"
}

function Map-TaskStatus {
  param([string]$Status)
  if ($Status -eq "done") { return "done" }
  if ($Status -eq "doing") { return "doing" }
  if ($Status -eq "blocked") { return "blocked" }
  return "todo"
}

function NullIfBlank {
  param($Value)
  $s = [string]$Value
  if ([string]::IsNullOrWhiteSpace($s)) { return $null }
  return $s
}

function Field {
  param($Object, [string[]]$Names, $Default = $null)
  foreach ($name in $Names) {
    if ($Object.PSObject.Properties.Name -contains $name) {
      $value = $Object.$name
      if ($null -ne $value) { return $value }
    }
  }
  return $Default
}

function FieldArray {
  param($Object, [string[]]$Names)
  $value = Field $Object $Names @()
  if ($null -eq $value) { return @() }
  if ($value -is [array]) { return @($value) }
  return @($value)
}

function CleanText {
  param($Value)
  if ($null -eq $Value) { return "" }
  return ([string]$Value).Replace([string][char]0x00B7, "-")
}

function Get-Sha256 {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

function Upload-Document {
  param([string]$RelativePath)
  $source = Join-Path $StorageDir ($RelativePath -replace "/", [IO.Path]::DirectorySeparatorChar)
  if (-not (Test-Path -LiteralPath $source)) {
    Write-Warning "Missing storage file: $RelativePath"
    return $false
  }
  $bytes = [IO.File]::ReadAllBytes($source)
  $contentType = "application/octet-stream"
  $target = [uri]::EscapeUriString("$SupabaseUrl/storage/v1/object/$Bucket/$RelativePath")
  Invoke-RestMethod -Method Post -Uri $target -Headers @{
    apikey = $ServiceRoleKey
    Authorization = "Bearer $ServiceRoleKey"
    "Content-Type" = $contentType
    "x-upsert" = "true"
  } -Body $bytes | Out-Null
  return $true
}

function Get-ExistingAuthUsers {
  $users = @()
  $page = 1
  do {
    $result = Invoke-RestMethod -Method Get `
      -Uri "$SupabaseUrl/auth/v1/admin/users?page=$page&per_page=1000" `
      -Headers @{ apikey = $ServiceRoleKey; Authorization = "Bearer $ServiceRoleKey"; Accept = "application/json" }
    $batch = if ($result.users) { @($result.users) } else { @($result) }
    $users += $batch
    $page++
  } while ($batch.Count -eq 1000)
  return $users
}

$script:ExistingAuthByEmail = @{}
foreach ($authUser in Get-ExistingAuthUsers) {
  if ($authUser.email) { $script:ExistingAuthByEmail[$authUser.email.ToLowerInvariant()] = $authUser }
}

Write-Host "Checking v3 staging schema..."
Invoke-Json -Method Get -Path "/rest/v1/profiles?select=id&limit=1" | Out-Null

if ($ClearExisting) {
  Write-Host "Clearing existing v3 staging data..."
  foreach ($table in @(
    "activity_log", "error_reports", "notifications", "documents", "project_updates",
    "tasks", "project_members", "projects", "workspace_members", "workspaces", "profiles"
  )) {
    try {
      Invoke-Json -Method Delete -Path "/rest/v1/${table}?created_at=not.is.null" -ExtraHeaders @{ Prefer = "return=minimal" } | Out-Null
      Write-Host "Cleared $table"
    } catch {
      Write-Warning "Could not clear $table`: $($_.Exception.Message)"
    }
  }
}

$legacyUsers = Read-BackupJson "wt_users"
$legacyProjects = Read-BackupJson "wt_projects"
$legacyTasks = Read-BackupJson "wt_tasks"
$legacyUpdates = Read-BackupJson "wt_updates"
$legacyAttachments = Read-BackupJson "wt_attachments"
$legacyNotifications = Read-BackupJson "wt_notifications"
$legacyActivity = Read-BackupJson "wt_activity_log"

$userMap = @{}
$authRows = @()
foreach ($u in $legacyUsers) {
  $auth = New-AuthUser $u
  $userMap[[string]$u.id] = $auth.id
  $authRows += [pscustomobject]@{
    legacyUserId = $u.id
    username = $u.username
    email = $auth.email
    authUserId = $auth.id
    tempPassword = $TempPassword
  }
}

$profiles = @($legacyUsers | ForEach-Object {
  [pscustomobject]@{
    id = $userMap[[string]$_.id]
    username = $_.username
    display_name = CleanText (Field $_ @("display_name", "displayName") $_.username)
    email = New-MigrationEmail $_
    role = if (@("admin", "manager", "user") -contains $_.role) { $_.role } else { "user" }
    department = if ($_.department) { $_.department } else { "" }
    avatar_url = ""
    color = if ($_.color) { $_.color } else { "#000000" }
    bio = CleanText $_.bio
    last_seen_at = Field $_ @("last_seen_at", "lastSeenAt") $null
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
    updated_at = (Get-Date).ToUniversalTime().ToString("o")
  }
})
Post-Rows "profiles" $profiles | Out-Null

$firstAdmin = @($legacyUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1)
$createdBy = if ($firstAdmin.Count) { $userMap[[string]$firstAdmin[0].id] } else { $profiles[0].id }
Post-Rows "workspaces" @([pscustomobject]@{
  id = $WorkspaceId
  name = "WorkTracker"
  created_by = $createdBy
  created_at = (Get-Date).ToUniversalTime().ToString("o")
  updated_at = (Get-Date).ToUniversalTime().ToString("o")
}) | Out-Null

$workspaceMembers = @($legacyUsers | ForEach-Object {
  [pscustomobject]@{
    workspace_id = $WorkspaceId
    user_id = $userMap[[string]$_.id]
    role = if ($_.role -eq "admin") { "admin" } else { "member" }
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
  }
})
Post-Rows "workspace_members" $workspaceMembers | Out-Null

$projectMap = @{}
foreach ($p in $legacyProjects) { $projectMap[[string]$p.id] = [guid]::NewGuid().ToString() }

$projects = @($legacyProjects | ForEach-Object {
  $ownerLegacyId = Field $_ @("owner_id", "ownerId") $null
  $owner = $userMap[[string]$ownerLegacyId]
  $projectName = if ($_.name) { $_.name } else { "Untitled project" }
  [pscustomobject]@{
    id = $projectMap[[string]$_.id]
    workspace_id = $WorkspaceId
    name = CleanText $projectName
    description = CleanText $_.notes
    status = Map-StatusProject $_.status
    priority = Map-Priority $_.priority
    owner_id = $owner
    department = if ($_.department) { $_.department } else { "" }
    progress = 0
    metadata = @{
      legacyId = $_.id
      type = $_.type
      workflowTemplate = Field $_ @("workflow_template", "workflowTemplate") ""
      isOngoing = [bool](Field $_ @("is_ongoing", "isOngoing") $false)
      cadence = $_.cadence
      editorIds = FieldArray $_ @("editor_ids", "editorIds")
    }
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
    updated_at = Field $_ @("updated_at", "updatedAt") (Get-Date).ToUniversalTime().ToString("o")
    completed_at = Field $_ @("completed_at", "completedAt") $null
  }
})
Post-Rows "projects" $projects | Out-Null

$projectMembers = @()
foreach ($p in $legacyProjects) {
  $projectUuid = $projectMap[[string]$p.id]
  $owner = $userMap[[string](Field $p @("owner_id", "ownerId") $null)]
  if ($owner) {
    $projectMembers += [pscustomobject]@{ project_id = $projectUuid; user_id = $owner; access = "owner"; created_at = (Get-Date).ToUniversalTime().ToString("o") }
  }
  foreach ($editorId in (FieldArray $p @("editor_ids", "editorIds"))) {
    $editor = $userMap[[string]$editorId]
    if ($editor -and $editor -ne $owner) {
      $projectMembers += [pscustomobject]@{ project_id = $projectUuid; user_id = $editor; access = "editor"; created_at = (Get-Date).ToUniversalTime().ToString("o") }
    }
  }
}
Post-Rows "project_members" $projectMembers | Out-Null

$taskMap = @{}
foreach ($t in $legacyTasks) { $taskMap[[string]$t.id] = [guid]::NewGuid().ToString() }

$tasks = @($legacyTasks | ForEach-Object {
  $status = Map-TaskStatus $_.status
  $projectLegacyId = Field $_ @("project_id", "projectId") $null
  $assigneeLegacyId = Field $_ @("assignee_id", "assigneeId") $null
  $taskTitle = if ($_.title) { $_.title } else { "Untitled task" }
  [pscustomObject]@{
    id = $taskMap[[string]$_.id]
    project_id = $projectMap[[string]$projectLegacyId]
    title = CleanText $taskTitle
    description = CleanText $_.notes
    status = $status
    priority = Map-Priority $_.priority
    assignee_id = if ($assigneeLegacyId) { $userMap[[string]$assigneeLegacyId] } else { $null }
    due_date = NullIfBlank (Field $_ @("due_date", "dueDate") $null)
    sort_order = [int](Field $_ @("sort_order", "sortOrder") 0)
    progress = if ($status -eq "done") { 100 } else { 0 }
    custom_fields = Field $_ @("custom_fields", "customFields") @()
    created_by = $null
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
    updated_at = Field $_ @("updated_at", "updatedAt") (Get-Date).ToUniversalTime().ToString("o")
    completed_at = if ($status -eq "done") { Field $_ @("updated_at", "updatedAt") $null } else { $null }
  }
} | Where-Object { $_.project_id })
Post-Rows "tasks" $tasks | Out-Null

$updates = @($legacyUpdates | ForEach-Object {
  $projectLegacyId = Field $_ @("project_id", "projectId") $null
  $userLegacyId = Field $_ @("user_id", "userId") $null
  [pscustomobject]@{
    id = [guid]::NewGuid().ToString()
    project_id = $projectMap[[string]$projectLegacyId]
    user_id = if ($userLegacyId) { $userMap[[string]$userLegacyId] } else { $null }
    body = CleanText $_.content
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
  }
} | Where-Object { $_.project_id -and $_.body })
Post-Rows "project_updates" $updates | Out-Null

$documents = @()
foreach ($a in $legacyAttachments) {
  $storagePath = Field $a @("storage_path", "storagePath") $null
  if (-not $storagePath) { continue }
  $uploaded = Upload-Document $storagePath
  if (-not $uploaded) { continue }
  $filePath = Join-Path $StorageDir ($storagePath -replace "/", [IO.Path]::DirectorySeparatorChar)
  $projectLegacyId = Field $a @("project_id", "projectId") $null
  $taskLegacyId = Field $a @("task_id", "taskId") $null
  $uploadedByLegacyId = Field $a @("uploaded_by", "uploadedBy") $null
  $documents += [pscustomobject]@{
    id = [guid]::NewGuid().ToString()
    project_id = $projectMap[[string]$projectLegacyId]
    task_id = if ($taskLegacyId) { $taskMap[[string]$taskLegacyId] } else { $null }
    uploaded_by = if ($uploadedByLegacyId) { $userMap[[string]$uploadedByLegacyId] } else { $null }
    file_name = CleanText (Field $a @("file_name", "fileName") "file")
    mime_type = Field $a @("mime_type", "mimeType") "application/octet-stream"
    document_type = Field $a @("document_type", "documentType") ""
    storage_path = $storagePath
    size_bytes = if (Test-Path -LiteralPath $filePath) { (Get-Item -LiteralPath $filePath).Length } else { 0 }
    checksum_sha256 = Get-Sha256 $filePath
    created_at = Field $a @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
  }
}
Post-Rows "documents" $documents | Out-Null

$notifications = @($legacyNotifications | ForEach-Object {
  $userLegacyId = Field $_ @("user_id", "userId") $null
  $actorLegacyId = Field $_ @("actor_user_id", "actorUserId") $null
  $projectLegacyId = Field $_ @("project_id", "projectId") $null
  [pscustomobject]@{
    id = [guid]::NewGuid().ToString()
    user_id = if ($userLegacyId) { $userMap[[string]$userLegacyId] } else { $null }
    actor_user_id = if ($actorLegacyId) { $userMap[[string]$actorLegacyId] } else { $null }
    type = if ($_.type) { $_.type } else { "info" }
    entity_type = Field $_ @("entity_type", "entityType") $null
    entity_id = $null
    project_id = if ($projectLegacyId) { $projectMap[[string]$projectLegacyId] } else { $null }
    message = CleanText $_.message
    read_at = Field $_ @("read_at", "readAt") $null
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
  }
} | Where-Object { $_.user_id })
Post-Rows "notifications" $notifications | Out-Null

$activity = @($legacyActivity | ForEach-Object {
  $userLegacyId = Field $_ @("user_id", "userId") $null
  $projectLegacyId = Field $_ @("project_id", "projectId") $null
  [pscustomobject]@{
    id = [guid]::NewGuid().ToString()
    user_id = if ($userLegacyId) { $userMap[[string]$userLegacyId] } else { $null }
    project_id = if ($projectLegacyId) { $projectMap[[string]$projectLegacyId] } else { $null }
    entity_type = Field $_ @("entity_type", "entityType") "system"
    entity_id = $null
    action = if ($_.action) { $_.action } else { "updated" }
    details = CleanText $_.details
    created_at = Field $_ @("created_at", "createdAt") (Get-Date).ToUniversalTime().ToString("o")
  }
})
Post-Rows "activity_log" $activity | Out-Null

$authCsv = Join-Path $BackupDir "v3-staging-auth-users.csv"
$authRows | Export-Csv -NoTypeInformation -LiteralPath $authCsv

$validation = [ordered]@{
  legacy = [ordered]@{
    users = $legacyUsers.Count
    projects = $legacyProjects.Count
    tasks = $legacyTasks.Count
    documents = $legacyAttachments.Count
    notifications = $legacyNotifications.Count
    activity = $legacyActivity.Count
  }
  imported = [ordered]@{
    profiles = $profiles.Count
    projects = $projects.Count
    tasks = $tasks.Count
    documents = $documents.Count
    notifications = $notifications.Count
    activity = $activity.Count
  }
  tempPassword = $TempPassword
  authUsersCsv = $authCsv
}

$validationPath = Join-Path $BackupDir "v3-staging-restore-report.json"
$validation | ConvertTo-Json -Depth 100 | Set-Content -Encoding utf8 -LiteralPath $validationPath

Write-Host "Restore complete."
Write-Host "Auth user CSV: $authCsv"
Write-Host "Restore report: $validationPath"
