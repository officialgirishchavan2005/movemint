# MOVEMINT Local Static Web Server
$port = 8080
$staticDir = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "MOVEMINT static site listening at http://localhost:$port/"

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $rawPath = $request.Url.LocalPath
            if ($rawPath -eq "/" -or [string]::IsNullOrWhiteSpace($rawPath)) {
                $rawPath = "/index.html"
            }

            $filePath = Join-Path $staticDir $rawPath.TrimStart('/')

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = "text/html; charset=utf-8"
                switch ($ext) {
                    ".css"   { $mime = "text/css; charset=utf-8" }
                    ".js"    { $mime = "application/javascript; charset=utf-8" }
                    ".json"  { $mime = "application/json; charset=utf-8" }
                    ".png"   { $mime = "image/png" }
                    ".jpg"   { $mime = "image/jpeg" }
                    ".svg"   { $mime = "image/svg+xml" }
                    ".woff2" { $mime = "font/woff2" }
                }
                $response.ContentType = $mime
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $indexPath = Join-Path $staticDir "index.html"
                $bytes = [System.IO.File]::ReadAllBytes($indexPath)
                $response.ContentType = "text/html; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
        } catch {
            try { $response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
}
