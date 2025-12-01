# Fix corrupted theme.css file
$goodLines = Get-Content "theme.css.backup" | Select-Object -First 821

# Dark mode CSS to append
$darkMode = @"

.progress-track {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%:
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

/* Dark Mode Overrides */
body.dark-theme {
  --background-color: #0f172a;
  --surface-color: #1e293b;
  --surface-alt: #334155;
  --surface-hover: #334155;
  --surface-glass: rgba(15, 23, 42, 0.92);

  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-light: #e2e8f0;

  --border-color: #475569;
  --border-light: #334155;
  --border-hover: #64748b;

  --primary-soft: #312e81;
  --primary-glass: rgba(99, 102, 241, 0.25);

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 4px 8px -2px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 16px 32px -8px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 12px 24px -6px rgba(0, 0, 0, 0.4);

  --success-soft: #064e3b;
  --warning-soft: #451a03;
  --danger-soft: #450a0a;
  --info-soft: #0c4a6e;
}
"@

# Combine and write
$goodLines + $darkMode | Set-Content "theme.css" -Encoding UTF8

Write-Host "theme.css has been fixed!" -ForegroundColor Green
