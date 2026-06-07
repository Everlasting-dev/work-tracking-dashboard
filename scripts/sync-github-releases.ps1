# Sync GitHub releases for WorkTracker go-live.
# Usage:
#   .\scripts\sync-github-releases.ps1 -Phase A          # strip all release assets
#   .\scripts\sync-github-releases.ps1 -Phase B          # notes-only historical releases
#   .\scripts\sync-github-releases.ps1 -Phase C          # publish v2.2.8 (requires local installer)
#   .\scripts\sync-github-releases.ps1 -Phase All        # B then C (run A separately first)

param(
    [ValidateSet('A', 'B', 'C', 'All')]
    [string]$Phase = 'All',
    [string]$Repo = 'Everlasting-dev/work-tracking-dashboard',
    [string]$ReleaseDir = 'release',
    [string]$CurrentVersion = '2.2.8'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

function Get-ReleaseTags {
    gh release list --repo $Repo --limit 100 --json tagName -q '.[].tagName'
}

function Strip-ReleaseAssets {
    param([string]$Tag)
    $assetNames = gh release view $Tag --repo $Repo --json assets -q '.assets[].name' 2>$null
    if (-not $assetNames) { return }
    foreach ($name in $assetNames) {
        if ([string]::IsNullOrWhiteSpace($name)) { continue }
        Write-Host "  Deleting asset $name from $Tag"
        gh release delete-asset $Tag $name --repo $Repo --yes
    }
}

function Invoke-PhaseA {
    Write-Host '=== Phase A: Strip all downloadable assets from existing releases ==='
    $tags = Get-ReleaseTags
    foreach ($tag in $tags) {
        Write-Host "Stripping assets: $tag"
        Strip-ReleaseAssets -Tag $tag
    }
    Write-Host 'Phase A complete.'
}

function Test-IsPrerelease {
    param([string]$Version)
    return $Version -match '(?i)(alpha|beta|rc|pre)'
}

function Get-LocalVersions {
    $pattern = Join-Path $ReleaseDir 'WorkTracker-Setup-*.exe'
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    $versions = @()
    foreach ($f in $files) {
        if ($f.Name -match 'WorkTracker-Setup-(.+)\.exe$') {
            $versions += $Matches[1]
        }
    }
    return $versions | Sort-Object { [version]($_ -replace '(?i)-alpha.*|-beta.*','') }, { $_ }
}

function Ensure-GitTag {
    param([string]$Tag, [string]$Message)
    $exists = git tag -l $Tag
    if (-not $exists) {
        Write-Host "  Creating tag $Tag"
        git tag -a $Tag -m $Message
    }
}

function Ensure-NotesOnlyRelease {
    param(
        [string]$Version,
        [string]$Tag
    )
    $title = "WorkTracker $Version"
    $notes = @"
Historical release record. Installer not publicly distributed.
Download the current stable build: **v$CurrentVersion** from Releases/latest.
"@
    $isPrerelease = Test-IsPrerelease -Version $Version
    $prereleaseFlag = if ($isPrerelease) { '--prerelease' } else { '' }

    $view = gh release view $Tag --repo $Repo 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Creating notes-only release $Tag"
        if ($prereleaseFlag) {
            gh release create $Tag --repo $Repo --title $title --notes $notes $prereleaseFlag --latest=false
        } else {
            gh release create $Tag --repo $Repo --title $title --notes $notes --latest=false
        }
    } else {
        Write-Host "  Updating notes-only release $Tag"
        gh release edit $Tag --repo $Repo --title $title --notes $notes --latest=false
        if ($isPrerelease) {
            gh release edit $Tag --repo $Repo --prerelease=true
        } else {
            gh release edit $Tag --repo $Repo --prerelease=false
        }
    }
}

function Invoke-PhaseB {
    Write-Host '=== Phase B: Notes-only releases for local version history ==='
    $versions = Get-LocalVersions | Where-Object { $_ -ne $CurrentVersion }
    foreach ($version in $versions) {
        $tag = "v$version"
        Write-Host "Processing $tag"
        Ensure-GitTag -Tag $tag -Message "WorkTracker $version (historical record)"
        Ensure-NotesOnlyRelease -Version $version -Tag $tag
    }
    Write-Host 'Phase B complete. Push tags with: git push origin --tags'
}

function Get-Changelog228Summary {
    $changelog = Get-Content -Path 'CHANGELOG.md' -Raw
    if ($changelog -match '(?s)## 2\.2\.8\s*\r?\n(.*?)(?=\r?\n## |\z)') {
        return ("## WorkTracker 2.2.8`n`n" + $Matches[1].Trim())
    }
    return 'WorkTracker 2.2.8 stable release.'
}

function Invoke-PhaseC {
    Write-Host '=== Phase C: Publish v2.2.8 with installer assets ==='
    $tag = "v$CurrentVersion"
    $exe = Join-Path $ReleaseDir "WorkTracker-Setup-$CurrentVersion.exe"
    $blockmap = "$exe.blockmap"
    $latestYml = Join-Path $ReleaseDir 'latest.yml'

    foreach ($path in @($exe, $blockmap, $latestYml)) {
        if (-not (Test-Path $path)) {
            throw "Missing required file for Phase C: $path"
        }
    }

    $notes = Get-Changelog228Summary
    $title = "WorkTracker $CurrentVersion"

    $view = gh release view $tag --repo $Repo 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating release $tag with assets"
        gh release create $tag --repo $Repo `
            $exe $blockmap $latestYml `
            --title $title `
            --notes $notes `
            --latest
    } else {
        Write-Host "Release $tag exists; uploading assets if missing"
        gh release upload $tag --repo $Repo $exe $blockmap $latestYml --clobber
        gh release edit $tag --repo $Repo --title $title --notes $notes
    }

    gh release edit $tag --repo $Repo --prerelease=false --latest=true
    Write-Host 'Phase C complete.'
}

switch ($Phase) {
    'A' { Invoke-PhaseA }
    'B' { Invoke-PhaseB }
    'C' { Invoke-PhaseC }
    'All' {
        Invoke-PhaseB
        Invoke-PhaseC
    }
}
