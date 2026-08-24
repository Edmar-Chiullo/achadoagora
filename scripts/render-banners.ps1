# Gera banners promocionais (colagem de prints) para Facebook/WhatsApp e Pinterest.
# Mesmo motor do render-promo.ps1: FFmpeg + Arial Bold + gradientes da marca.
#
# Uso: pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/render-banners.ps1
#      [-ImagesDir app\assets\video] [-OutDir banners]

param(
    [string]$ImagesDir = "app\assets\video",
    [string]$OutDir = "banners"
)

$ErrorActionPreference = "Stop"

$ffmpeg = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\ffmpeg.exe"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
    $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($cmd) { $ffmpeg = $cmd.Source } else { throw "ffmpeg nao encontrado." }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$imagesDirAbs = Join-Path $projectRoot $ImagesDir
$outAbs = Join-Path $projectRoot $OutDir
New-Item -ItemType Directory -Force -Path $outAbs | Out-Null

$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "achadinhos-banners"
if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null

$utf8 = [System.Text.UTF8Encoding]::new($false)
function WriteUtf8([string]$path, [string]$content) {
    [System.IO.File]::WriteAllText($path, $content, $utf8)
}
$fontEsc = 'C\:/Windows/Fonts/arialbd.ttf'
if (-not (Test-Path 'C:\Windows\Fonts\arialbd.ttf')) { throw "Fonte arialbd.ttf nao encontrada." }

function Img([string]$name) {
    $p = Join-Path $imagesDirAbs $name
    if (-not (Test-Path -LiteralPath $p)) { throw "Imagem nao encontrada: $name" }
    return $p
}
function Grad([string]$file, [int]$w, [int]$h) {
    & $ffmpeg -y -hide_banner -loglevel error `
        -f lavfi -i "gradients=s=${w}x${h}:c0=0xF97316:c1=0xF43F5E:x0=0:y0=0:x1=$($w-1):y1=0:d=1" `
        -frames:v 1 (Join-Path $tmp $file)
    if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar gradiente $file" }
    return ((Join-Path $tmp $file) -replace '\\', '/') -replace ':', '\:'
}
function TextFile([string]$name, [string]$text) {
    $p = Join-Path $tmp $name
    WriteUtf8 $p $text
    return (($p -replace '\\', '/') -replace ':', '\:')
}

$titleTf = TextFile "title.txt" "QUER UMA PÁGINA ASSIM?"
$subTf = TextFile "sub.txt" "Eu crio pra você!"
$ctaTf = TextFile "cta.txt" "Chama no WhatsApp e peça a sua!"

function DrawText([string]$inLabel, [string]$tf, [int]$fs, [string]$x, [string]$y, [string]$outLabel) {
    return ("{0}drawtext=fontfile='{1}':textfile='{2}':fontcolor=white:fontsize={3}:x={4}:y={5}{6}" -f `
            $inLabel, $fontEsc, $tf, $fs, $x, $y, $outLabel)
}

# ---------------------------------------------------------------------------
# Banner 1 — Facebook / WhatsApp 1080x1080
# Colagem 2x2 + faixa de titulo + faixa CTA
# ---------------------------------------------------------------------------
Write-Host "Gerando banner-facebook-whatsapp-1080x1080.png ..."

$W = 1080; $H = 1080
$topH = 240; $ctaH = 130; $ctaY = $H - $ctaH
$m = 24
$tileW = ($W - 3 * $m) / 2          # 504
$tileH = ($ctaY - $topH - 3 * $m) / 2 # 319
$x1 = $m; $x2 = $m + $tileW + $m     # 24 / 552
$y1 = $topH + $m                     # 264
$y2 = $y1 + $tileH + $m              # 607

$topBand = Grad "fb_top.png" $W $topH
$ctaBand = Grad "fb_cta.png" $W $ctaH

$tilesFb = @("01-home.png", "03-produtos-recentes.png", "05-dashboard.png", "06-Adm-visitas.png")

$filter = @"
[1:v]scale=${tileW}:${tileH}:force_original_aspect_ratio=increase,crop=${tileW}:${tileH}[t1];
[2:v]scale=${tileW}:${tileH}:force_original_aspect_ratio=increase,crop=${tileW}:${tileH}[t2];
[3:v]scale=${tileW}:${tileH}:force_original_aspect_ratio=increase,crop=${tileW}:${tileH}[t3];
[4:v]scale=${tileW}:${tileH}:force_original_aspect_ratio=increase,crop=${tileW}:${tileH}[t4];
[0:v][t1]overlay=${x1}:${y1}[b1];
[b1][t2]overlay=${x2}:${y1}[b2];
[b2][t3]overlay=${x1}:${y2}[b3];
[b3][t4]overlay=${x2}:${y2}[b4];
[b4][5:v]overlay=0:0[b5];
[b5][6:v]overlay=0:${ctaY}[b6]
"@
$filter += ";`n" + (DrawText "[b6]" $titleTf 64 "(w-text_w)/2" "54" "")
$filter += "," + (DrawText "" $subTf 44 "(w-text_w)/2" "148" "")
$filter += "," + (DrawText "" $ctaTf 46 "(w-text_w)/2" "${ctaY}+(${ctaH}-text_h)/2" "[out]")

$filterPath = Join-Path $tmp "banner_fb.txt"
WriteUtf8 $filterPath $filter

& $ffmpeg -y -hide_banner -loglevel error `
    -f lavfi -i "color=c=0xFFF7ED:s=${W}x${H}" `
    -i (Img $tilesFb[0]) -i (Img $tilesFb[1]) -i (Img $tilesFb[2]) -i (Img $tilesFb[3]) `
    -i (Join-Path $tmp "fb_top.png") -i (Join-Path $tmp "fb_cta.png") `
    -/filter_complex $filterPath `
    -map "[out]" -frames:v 1 `
    (Join-Path $outAbs "banner-facebook-whatsapp-1080x1080.png")
if ($LASTEXITCODE -ne 0) { throw "Falha no banner Facebook/WhatsApp." }

# ---------------------------------------------------------------------------
# Banner 2 — Pinterest 1000x1500
# Tres faixas empilhadas + titulo + CTA
# ---------------------------------------------------------------------------
Write-Host "Gerando banner-pinterest-1000x1500.png ..."

$W = 1000; $H = 1500
$topH = 300; $ctaH = 150; $ctaY = $H - $ctaH
$m = 24; $gap = 20
$strW = $W - 2 * $m                  # 952
$strH = [math]::Floor(($ctaY - $topH - 4 * $gap) / 3)  # ~322
$sy1 = $topH + $gap
$sy2 = $sy1 + $strH + $gap
$sy3 = $sy2 + $strH + $gap

$topBand = Grad "pin_top.png" $W $topH
$ctaBand = Grad "pin_cta.png" $W $ctaH

$tilesPin = @("01-home.png", "02-categosrias-e-produtos-recentes.png", "05-dashboard.png")

$filter = @"
[1:v]scale=${strW}:${strH}:force_original_aspect_ratio=increase,crop=${strW}:${strH}[s1];
[2:v]scale=${strW}:${strH}:force_original_aspect_ratio=increase,crop=${strW}:${strH}[s2];
[3:v]scale=${strW}:${strH}:force_original_aspect_ratio=increase,crop=${strW}:${strH}[s3];
[0:v][s1]overlay=${m}:${sy1}[p1];
[p1][s2]overlay=${m}:${sy2}[p2];
[p2][s3]overlay=${m}:${sy3}[p3];
[p3][4:v]overlay=0:0[p4];
[p4][5:v]overlay=0:${ctaY}[p5]
"@
$filter += ";`n" + (DrawText "[p5]" $titleTf 68 "(w-text_w)/2" "78" "")
$filter += "," + (DrawText "" $subTf 48 "(w-text_w)/2" "196" "")
$filter += "," + (DrawText "" $ctaTf 46 "(w-text_w)/2" "${ctaY}+(${ctaH}-text_h)/2" "[out]")

$filterPath = Join-Path $tmp "banner_pin.txt"
WriteUtf8 $filterPath $filter

& $ffmpeg -y -hide_banner -loglevel error `
    -f lavfi -i "color=c=0xFFF7ED:s=${W}x${H}" `
    -i (Img $tilesPin[0]) -i (Img $tilesPin[1]) -i (Img $tilesPin[2]) `
    -i (Join-Path $tmp "pin_top.png") -i (Join-Path $tmp "pin_cta.png") `
    -/filter_complex $filterPath `
    -map "[out]" -frames:v 1 `
    (Join-Path $outAbs "banner-pinterest-1000x1500.png")
if ($LASTEXITCODE -ne 0) { throw "Falha no banner Pinterest." }

Remove-Item -LiteralPath $tmp -Recurse -Force

Write-Host ""
Get-ChildItem -LiteralPath $outAbs -Filter *.png | ForEach-Object {
    Write-Host ("OK -> {0} ({1:N0} KB)" -f $_.FullName, ($_.Length / 1KB))
}
