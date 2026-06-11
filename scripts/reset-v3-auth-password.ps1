param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,

  [Parameter(Mandatory = $true)]
  [string]$ServiceRoleKey,

  [Parameter(Mandatory = $true)]
  [string]$UsernameOrEmail,

  [Parameter(Mandatory = $true)]
  [string]$Password
)

$ErrorActionPreference = "Stop"

$headers = @{
  apikey = $ServiceRoleKey
  Authorization = "Bearer $ServiceRoleKey"
  "Content-Type" = "application/json"
  Prefer = "return=representation"
}

$base = $SupabaseUrl.TrimEnd("/")
$needle = $UsernameOrEmail.Trim()
$encoded = [uri]::EscapeDataString($needle)

if ($needle.Contains("@")) {
  $profileUri = "$base/rest/v1/profiles?select=id,username,email&email=eq.$encoded&limit=1"
} else {
  $profileUri = "$base/rest/v1/profiles?select=id,username,email&username=eq.$encoded&limit=1"
}

$profileRows = Invoke-RestMethod -Method GET -Uri $profileUri -Headers $headers
$profile = @($profileRows)[0]
if (-not $profile -or -not $profile.id) {
  throw "No profile found for '$UsernameOrEmail'."
}

$body = @{ password = $Password } | ConvertTo-Json
$authUri = "$base/auth/v1/admin/users/$($profile.id)"
Invoke-RestMethod -Method PUT -Uri $authUri -Headers $headers -Body $body | Out-Null

Write-Host "Password reset for $($profile.username) <$($profile.email)>"
