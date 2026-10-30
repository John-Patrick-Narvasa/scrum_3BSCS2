
[CmdletBinding()]
param(
    [switch]$Apply,
    [string]$ExpectedProjectRef
)

$ErrorActionPreference = 'Stop'
$exitCode = 0
$securePassword = $null
$passwordPointer = [IntPtr]::Zero
$plainPassword = $null
$encodedPassword = $null
$dbUrl = $null

$repoRoot = Split-Path -Parent $PSScriptRoot
$supabaseDir = Join-Path $repoRoot 'supabase'
$projectRefFile = Join-Path $supabaseDir '.temp\project-ref'

function Invoke-Supabase {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    Write-Host "`n> $Description" -ForegroundColor Cyan

    & npx supabase @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "Supabase CLI failed with exit code $LASTEXITCODE."
    }
}

Push-Location $repoRoot

try {
    if (-not (Test-Path $supabaseDir)) {
        throw "The supabase directory was not found."
    }

    if (-not (Test-Path (Join-Path $supabaseDir 'migrations'))) {
        throw "The migrations directory was not found."
    }

    if (-not (Test-Path $projectRefFile)) {
        throw "No linked Supabase project found. Run npx supabase link first."
    }

    $linkedProjectRef = (Get-Content $projectRefFile -Raw).Trim()

    if ([string]::IsNullOrWhiteSpace($linkedProjectRef)) {
        throw "The linked project reference is empty."
    }

    if ($Apply -and [string]::IsNullOrWhiteSpace($ExpectedProjectRef)) {
        throw "Apply mode requires -ExpectedProjectRef."
    }

    if (
        -not [string]::IsNullOrWhiteSpace($ExpectedProjectRef) -and
        $ExpectedProjectRef -ne $linkedProjectRef
    ) {
        throw "Project reference mismatch. The linked project is '$linkedProjectRef'."
    }

    Write-Host "`nLinked Supabase project: $linkedProjectRef" -ForegroundColor Yellow

    $poolerHost = (Read-Host "Enter your Session Pooler hostname").Trim()

    if ($poolerHost -notmatch '^[a-zA-Z0-9.-]+\.pooler\.supabase\.com$') {
        throw "Invalid Session Pooler hostname."
    }

    $securePassword = Read-Host "Enter your Supabase database password" -AsSecureString

    if ($securePassword.Length -eq 0) {
        throw "Database password cannot be empty."
    }

    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
        $securePassword
    )

    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
        $passwordPointer
    )

    $encodedPassword = [uri]::EscapeDataString($plainPassword)

    $dbUser = "postgres.$linkedProjectRef"

    $dbUrl = "postgresql://${dbUser}:${encodedPassword}@${poolerHost}:5432/postgres?sslmode=require"

    Write-Host "`nChecking migration history..." -ForegroundColor Yellow

    Invoke-Supabase `
        -Description "Supabase migration list (Session Pooler)" `
        -Arguments @('migration', 'list', '--db-url', $dbUrl)

    Write-Host "`nPreviewing pending migrations..." -ForegroundColor Yellow

    Invoke-Supabase `
        -Description "Supabase database push dry run (Session Pooler)" `
        -Arguments @('db', 'push', '--db-url', $dbUrl, '--dry-run')

    if (-not $Apply) {
        Write-Host "`nPreview completed. No migrations were applied." -ForegroundColor Green
        return
    }

    Write-Host "`nWARNING: This will apply pending migrations." -ForegroundColor Red

    $confirmation = Read-Host "Type the exact project reference '$linkedProjectRef' to continue"

    if ($confirmation -cne $linkedProjectRef) {
        Write-Host "Confirmation did not match. No migrations were applied." -ForegroundColor Yellow
        return
    }

    Write-Host "`nApplying migrations..." -ForegroundColor Yellow

    Invoke-Supabase `
        -Description "Supabase database push (Session Pooler)" `
        -Arguments @('db', 'push', '--db-url', $dbUrl)

    Write-Host "`nMigration command completed successfully." -ForegroundColor Green
}
catch {
    Write-Host "`nERROR: $_" -ForegroundColor Red
    $exitCode = 1
}
finally {
    $dbUrl = $null
    $plainPassword = $null
    $encodedPassword = $null

    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }

    if ($null -ne $securePassword) {
        $securePassword.Dispose()
    }

    Pop-Location
}

if ($exitCode -ne 0) {
    exit $exitCode
}
