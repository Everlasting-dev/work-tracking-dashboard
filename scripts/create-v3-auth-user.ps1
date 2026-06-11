param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$ServiceRoleKey,

  [Parameter(Mandatory = $true)]
  [string]$Username,

  [Parameter(Mandatory = $true)]
  [string]$Password,

  [string]$Email = "",
  [string]$DisplayName = "",
  [ValidateSet("admin", "manager", "user")]
  [string]$Role = "user",
  [string]$Department = ""
)

$ErrorActionPreference = "Stop"

function Invoke-SupabaseAdmin {
  param(
    [string]$Method,
    [string]$Path,
    $Body = $null
  )

  $headers = @{
    apikey = $ServiceRoleKey
    Authorization = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
    Prefer = "resolution=merge-duplicates,return=representation"
  }
  $uri = "$($SupabaseUrl.TrimEnd('/'))$Path"
  $json = if ($null -ne $Body) { $Body | ConvertTo-Json -Depth 8 } else { $null }
  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $json
}

$usernameClean = $Username.Trim().ToLowerInvariant()
if (-not $Email) {
  $Email = "$usernameClean@worktracker-migration.local"
}
if (-not $DisplayName) {
  $DisplayName = $Username
}

Write-Host "Creating Supabase Auth user '$Email'..."
$authUser = Invoke-SupabaseAdmin -Method "POST" -Path "/auth/v1/admin/users" -Body @{
  email = $Email
  password = $Password
  email_confirm = $true
  user_metadata = @{
    username = $usernameClean
    display_name = $DisplayName
    role = $Role
  }
}

$userId = $authUser.id
if (-not $userId) {
  throw "Auth user was not created. No id returned."
}

Write-Host "Upserting public.profiles row..."
$profileBody = @(
  @{
    id = $userId
    username = $usernameClean
    display_name = $DisplayName
    email = $Email
    role = $Role
    department = $Department
  }
)

Invoke-SupabaseAdmin -Method "POST" -Path "/rest/v1/profiles?on_conflict=id" -Body $profileBody | Out-Null

Write-Host "Done. Login with:"
Write-Host "  username: $usernameClean"
Write-Host "  email:    $Email"
