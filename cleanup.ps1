# Cleanup Script for dduhack Project
# Removes unnecessary and duplicate documentation files

Write-Host "🗑️  Starting cleanup of dduhack project..." -ForegroundColor Cyan
Write-Host ""

# List of files to delete
$filesToDelete = @(
    "ADVANCED_SEARCH_FEATURES.md",
    "CERTIFICATES_MOBILE_CONVERSION.md",
    "CHANGES_MADE.md",
    "CHANGE_LOG_SETTINGS.md",
    "COMPLETE_MOBILE_CONVERSION_SUMMARY.md",
    "COMPLETE_SUMMARY.md",
    "COMPLETION_REPORT.md",
    "CONVERSION_COMPLETE.md",
    "DEPLOYMENT_CHECKLIST.md",
    "DOCUMENTATION_INDEX_SETTINGS.md",
    "DOCUMENTATION_INDEX_STUDENT_SIDEBAR.md",
    "DUPLICATE_MEMBER_PREVENTION.md",
    "ERROR_TECHNICAL_EXPLANATION.md",
    "EXECUTIVE_SUMMARY.md",
    "EXISTING_VS_NEW_USERS.md",
    "FILES_CREATED_MODIFIED.md",
    "FILE_MANIFEST_SETTINGS.md",
    "FINAL_CHECKLIST_STUDENT_SIDEBAR.md",
    "FINAL_STATUS.md",
    "HYDRATION_DEEP_GUIDE.md",
    "HYDRATION_FIX_FINAL.md",
    "HYDRATION_FIX_SUMMARY.md",
    "IMPLEMENTATION_CHECKLIST_COMPLETE.md",
    "IMPLEMENTATION_GUIDE.md",
    "IMPLEMENTATION_SUMMARY.md",
    "INDEX.md",
    "INTEGRATION_GUIDE.md",
    "ISSUES_FIXED.md",
    "MASTER_GUIDE.md",
    "MOBILE_CONVERSION_COMPLETE.md",
    "MOBILE_CONVERSION_SUMMARY.md",
    "MOBILE_OPTIMIZATION.md",
    "MOBILE_RESPONSIVE_IMPROVEMENTS.md",
    "MOBILE_RESPONSIVE_QUICK_REFERENCE.md",
    "OTP_SYSTEM_ARCHITECTURE_GUIDE.md",
    "OTP_SYSTEM_COMPLETION_SUMMARY.md",
    "OTP_SYSTEM_DOCUMENTATION_INDEX.md",
    "OTP_SYSTEM_FINAL_VERIFICATION.md",
    "OTP_SYSTEM_IMPLEMENTATION_INDEX.md"
)

$projectPath = "c:\Users\DELL\OneDrive\Pictures\demo\dduhack"
$deletedCount = 0
$notFoundCount = 0

Write-Host "📋 Files to delete: $($filesToDelete.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $filesToDelete) {
    $filePath = Join-Path $projectPath $file
    
    if (Test-Path $filePath) {
        try {
            Remove-Item -Path $filePath -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "❌ Error deleting: $file" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  Not found: $file" -ForegroundColor DarkGray
        $notFoundCount++
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   ✅ Files deleted: $deletedCount" -ForegroundColor Green
Write-Host "   ⚠️  Files not found: $notFoundCount" -ForegroundColor DarkGray
Write-Host "   📝 Total processed: $($filesToDelete.Count)" -ForegroundColor Cyan
Write-Host ""

# Count remaining .md files
$remainingFiles = (Get-ChildItem -Path $projectPath -Filter "*.md" | Measure-Object).Count
Write-Host "📁 Remaining .md files: $remainingFiles" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Project is now cleaner and more organized!" -ForegroundColor Green
