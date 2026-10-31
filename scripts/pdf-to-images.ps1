<#
.SYNOPSIS
  Renders the pages of a PDF (or a PDF-compatible Adobe Illustrator .ai file) to JPG or PNG
  images with the PDF engine built into Windows. No extra software is needed.

.EXAMPLE
  # Page count, page sizes and the app that exported the file
  powershell -ExecutionPolicy Bypass -File scripts\pdf-to-images.ps1 -InputPath "D:\Fotoowl\Backdrop.pdf" -Info

.EXAMPLE
  # Render every page 2000 px wide into a project's image folder (backdrop-01.jpg, backdrop-02.jpg ...)
  powershell -ExecutionPolicy Bypass -File scripts\pdf-to-images.ps1 -InputPath "D:\Fotoowl\Backdrop.pdf" -OutputDirectory "src\assets\work\fotoowl-event-backdrops" -Name backdrop

.EXAMPLE
  # Render only pages 1, 3 and 5
  powershell -ExecutionPolicy Bypass -File scripts\pdf-to-images.ps1 -InputPath "brochure.pdf" -OutputDirectory out -Pages 1,3,5
#>
param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [string]$OutputDirectory,
    [int[]]$Pages,
    [int]$Width = 2000,
    [string]$Name,
    [ValidateSet('jpg', 'png')][string]$Format = 'jpg',
    [switch]$Info
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapEncoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]

$extensionMethods = [System.WindowsRuntimeSystemExtensions].GetMethods()
$asTaskOperation = $extensionMethods | Where-Object {
    $_.Name -eq 'AsTask' -and $_.IsGenericMethodDefinition -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
} | Select-Object -First 1
$asTaskAction = $extensionMethods | Where-Object {
    $_.Name -eq 'AsTask' -and -not $_.IsGenericMethodDefinition -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'
} | Select-Object -First 1

function Wait-Operation($Operation, [Type]$ResultType) {
    $asTaskOperation.MakeGenericMethod($ResultType).Invoke($null, @($Operation)).GetAwaiter().GetResult()
}
function Wait-Action($Action) {
    $asTaskAction.Invoke($null, @($Action)).GetAwaiter().GetResult()
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$file = Wait-Operation ([Windows.Storage.StorageFile]::GetFileFromPathAsync($resolvedInput)) ([Windows.Storage.StorageFile])
try {
    $pdf = Wait-Operation ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
}
catch {
    throw "Windows could not open '$resolvedInput' as a PDF. For .ai files, re-save from Illustrator with 'Create PDF Compatible File' enabled, or export a PDF."
}

if ($Info) {
    # Read the start and end of the file to find the exporting app (Canva, Illustrator, Photoshop ...).
    $stream = [System.IO.File]::OpenRead($resolvedInput)
    try {
        $latin1 = [System.Text.Encoding]::GetEncoding(28591)
        $chunk = [Math]::Min($stream.Length, 2MB)
        $buffer = New-Object byte[] $chunk
        [void]$stream.Read($buffer, 0, $chunk)
        $text = $latin1.GetString($buffer)
        $stream.Seek([Math]::Max(0, $stream.Length - $chunk), 'Begin') | Out-Null
        [void]$stream.Read($buffer, 0, $chunk)
        $text += $latin1.GetString($buffer)
    }
    finally { $stream.Dispose() }
    $meta = [regex]::Matches($text, '/(Title|Author|Creator|Producer|CreationDate)\s*\(([^)]{0,120})\)') |
        ForEach-Object { '{0}={1}' -f $_.Groups[1].Value, $_.Groups[2].Value } | Select-Object -Unique
    $xmpTool = [regex]::Matches($text, '<xmp:CreatorTool>([^<]{0,120})</xmp:CreatorTool>') |
        ForEach-Object { 'CreatorTool=' + $_.Groups[1].Value } | Select-Object -Unique

    Write-Output ("File:  {0}" -f $resolvedInput)
    Write-Output ("Pages: {0}" -f $pdf.PageCount)
    if ($meta -or $xmpTool) { Write-Output ("Meta:  {0}" -f ((@($meta) + @($xmpTool)) -join ' | ')) }
    for ($i = 0; $i -lt $pdf.PageCount; $i++) {
        $p = $pdf.GetPage([uint32]$i)
        # PdfPage.Size is in device-independent pixels (1/96 in); PDF points are 1/72 in.
        $wPt = $p.Size.Width * 0.75; $hPt = $p.Size.Height * 0.75
        Write-Output ("  page {0,2}: {1,7:N0} x {2,-7:N0} pt  ({3,6:N0} x {4,-6:N0} mm)  ratio {5:N3}" -f ($i + 1), $wPt, $hPt, ($wPt / 72 * 25.4), ($hPt / 72 * 25.4), ($p.Size.Width / $p.Size.Height))
        $p.Dispose()
    }
    return
}

if (-not $OutputDirectory) { throw 'Pass -OutputDirectory (or -Info to only inspect the file).' }
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$resolvedOutput = (Resolve-Path -LiteralPath $OutputDirectory).Path
if (-not $Name) {
    $Name = ([System.IO.Path]::GetFileNameWithoutExtension($resolvedInput) -replace '[^a-zA-Z0-9]+', '-').Trim('-').ToLowerInvariant()
}
if (-not $Pages) { $Pages = 1..$pdf.PageCount }
Add-Type -AssemblyName System.Drawing

function Render-Page([int]$PageNumber, [int]$DestinationWidth) {
    if ($PageNumber -lt 1 -or $PageNumber -gt $pdf.PageCount) {
        throw "Page $PageNumber is outside the document's 1-$($pdf.PageCount) range."
    }
    $page = $pdf.GetPage([uint32]($PageNumber - 1))
    $memory = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $options = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    $options.DestinationWidth = [uint32]$DestinationWidth
    if ($Format -eq 'jpg') { $options.BitmapEncoderId = [Windows.Graphics.Imaging.BitmapEncoder]::JpegEncoderId }
    try {
        Wait-Action ($page.RenderToStreamAsync($memory, $options))
        $memory.Seek(0)
        $target = Join-Path $resolvedOutput ('{0}-{1:D2}.{2}' -f $Name, $PageNumber, $Format)
        $source = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($memory)
        $output = [System.IO.File]::Create($target)
        try { $source.CopyTo($output) } finally { $output.Dispose(); $source.Dispose() }
        return $target
    }
    finally {
        $memory.Dispose()
        $page.Dispose()
    }
}

function Get-PixelWidth([string]$Path) {
    $img = [System.Drawing.Image]::FromFile($Path)
    try { return $img.Width } finally { $img.Dispose() }
}

# Windows renders at the display's scale factor (e.g. 125%), so the first page is used to
# measure that factor and every page is then rendered at exactly the requested width.
$scale = $null
foreach ($pageNumber in $Pages) {
    $destination = if ($scale) { [int][Math]::Round($Width / $scale) } else { $Width }
    $target = Render-Page $pageNumber $destination
    if (-not $scale) {
        $actual = Get-PixelWidth $target
        $scale = $actual / $destination
        if ([Math]::Abs($actual - $Width) -gt 2) {
            $target = Render-Page $pageNumber ([int][Math]::Round($Width / $scale))
        }
    }
    Write-Output $target
}
