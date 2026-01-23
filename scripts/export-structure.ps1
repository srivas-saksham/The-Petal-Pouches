# export-structure.ps1
# Generates directory-structure.txt excluding node_modules and .git

$OutputFile = "docx\directory-structure.txt"

# Ensure the output folder exists
if (-not (Test-Path "docx")) {
    New-Item -ItemType Directory -Path "docx" | Out-Null
}

# Get all files recursively, exclude node_modules and .git
$Files = Get-ChildItem -Recurse -File `
    -Exclude "directory-structure.txt" `
    | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' }

# Save full paths to file
$Files.FullName | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "Directory structure exported to $OutputFile"
