# Renderiza o video promocional vertical (1080x1920, 30s) a partir dos prints
# em app/assets/video/, com pan esquerda->direita por cena, legenda com
# fade-in sobre barra em gradiente laranja->rosa e transicoes laterais.
#
# Uso: pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/render-promo.ps1
#      [-ImagesDir app\assets\video] [-OutPath achadinhos-promo.mp4] [-KeepTemp]

param(
    [string]$ImagesDir = "app\assets\video",
    [string]$OutPath = "achadinhos-promo.mp4",
    [int]$Width = 1080,
    [int]$Height = 1920,
    [int]$Fps = 30,
    [double]$TotalDuration = 30.0,
    [double]$Transition = 0.45,
    [switch]$KeepTemp
)

$ErrorActionPreference = "Stop"

# --- ffmpeg ---------------------------------------------------------------
$ffmpeg = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\ffmpeg.exe"
if (-not (Test-Path -LiteralPath $ffmpeg)) {
    $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($cmd) { $ffmpeg = $cmd.Source } else { throw "ffmpeg nao encontrado." }
}

$inv = [System.Globalization.CultureInfo]::InvariantCulture
function Num([double]$v) { $v.ToString("0.######", $inv) }

# --- cenas: arquivos (ordem alfabetica) e legendas ------------------------
$captions = @(
    , @("Imagina ter sua própria", "página de achadinhos…")
    , @("Tudo organizado e com", "novidades todo dia")
    , @("Cada achado com botão", "direto pra comprar")
    , @("Seu público conectado", "com você")
    , @("E você no controle", "de TUDO")
    , @("Veja quantas pessoas", "estão te visitando")
    , @("Cadastrar produto é só", "colar o link")
    , @("Mercado Livre, Shopee,", "Hotmart e mais")
    , @("Quer a sua?", "Me chama!")
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$imagesDirAbs = Join-Path $projectRoot $ImagesDir
$outAbs = Join-Path $projectRoot $OutPath

$images = @(Get-ChildItem -LiteralPath $imagesDirAbs -Filter *.png | Sort-Object Name)
if ($images.Count -ne $captions.Count) {
    throw "Esperava $($captions.Count) imagens em '$ImagesDir', encontrei $($images.Count)."
}

# --- tempos ----------------------------------------------------------------
$n = $images.Count
$framesPerScene = [int][math]::Round((($TotalDuration + ($n - 1) * $Transition) / $n) * $Fps)
$sceneDuration = $framesPerScene / $Fps
$totalFrames = $n * $framesPerScene - [int][math]::Round(($n - 1) * $Transition * $Fps)
Write-Host ("Cenas: {0} | {1} frames/cena ({2}s) | transicao {3}s | total alvo ~{4}s" -f `
        $n, $framesPerScene, (Num $sceneDuration), (Num $Transition), (Num ($totalFrames / $Fps)))

# --- area de trabalho temporaria -------------------------------------------
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "achadinhos-render"
if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null

$utf8 = [System.Text.UTF8Encoding]::new($false)
function WriteUtf8([string]$path, [string]$content) {
    [System.IO.File]::WriteAllText($path, $content, $utf8)
}
$fontEsc = 'C\:/Windows/Fonts/arialbd.ttf'
if (-not (Test-Path 'C:\Windows\Fonts\arialbd.ttf')) { throw "Fonte arialbd.ttf nao encontrada." }

# barra em gradiente laranja -> rosa (marca)
$barW = 960; $barH = 150; $barY = 1340
& $ffmpeg -y -hide_banner -loglevel error `
    -f lavfi -i "gradients=s=$($barW)x$($barH):c0=0xF97316:c1=0xF43F5E:x0=0:y0=0:x1=$($barW-1):y1=0:d=1" `
    -frames:v 1 (Join-Path $tmp "bar.png")
if ($LASTEXITCODE -ne 0) { throw "Falha ao gerar barra de gradiente." }
$barEsc = (Join-Path $tmp "bar.png") -replace '\\', '/' -replace ':', '\:'
$lineY1 = $barY + 28
$lineY2 = $barY + 88

# --- cena por cena ----------------------------------------------------------
for ($i = 0; $i -lt $n; $i++) {
    $img = $images[$i]
    Write-Host ("[{0}/{1}] {2}" -f ($i + 1), $n, $img.Name)

    $textFiles = @()
    $drawParts = @()
    for ($l = 0; $l -lt 2; $l++) {
        $tf = Join-Path $tmp ("line_{0}_{1}.txt" -f $i, $l)
        WriteUtf8 $tf $captions[$i][$l]
        $tfEsc = ($tf -replace '\\', '/') -replace ':', '\:'
        $y = if ($l -eq 0) { $lineY1 } else { $lineY2 }
        $fmt = "drawtext=fontfile='{0}':textfile='{1}':fontcolor=white:fontsize=50:" +
            "x=(w-text_w)/2:y={2}:alpha='min(1\,t/0.35)'"
        $drawParts += ($fmt -f $fontEsc, $tfEsc, $y)
        $textFiles += $tf
    }

    $ease = "(iw-ow)*(3*pow(t/{0}\,2)-2*pow(t/{0}\,3))" -f (Num $sceneDuration)
    $filter = (
        "[0:v]scale=-2:$Height,crop=${Width}:${Height}:x='$ease':y=0,setsar=1[bg];`n" +
        "[1:v]format=rgba,colorchannelmixer=aa=0.93[bar];`n" +
        "[bg][bar]overlay=x=(W-w)/2:y=$barY[bgb];`n" +
        "[bgb]" + ($drawParts -join ",") + "[out]"
    )
    $filterPath = Join-Path $tmp ("scene_filter_{0}.txt" -f $i)
    WriteUtf8 $filterPath $filter

    $sceneOut = Join-Path $tmp ("scene_{0:D2}.mp4" -f ($i + 1))
    & $ffmpeg -y -hide_banner -loglevel error `
        -loop 1 -framerate $Fps -t (Num $sceneDuration) -i $img.FullName `
        -i (Join-Path $tmp "bar.png") `
        -/filter_complex $filterPath `
        -map "[out]" -r $Fps -frames:v $framesPerScene -an `
        -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p `
        $sceneOut
    if ($LASTEXITCODE -ne 0) { throw "Falha ao renderizar cena $($i + 1)." }
}

# --- montagem final com transicoes -----------------------------------------
$filterParts = @()
$prev = "[0:v]"
for ($k = 1; $k -lt $n; $k++) {
    $offset = $k * ($sceneDuration - $Transition)
    $outLabel = if ($k -eq $n - 1) { "[vout]" } else { ("[v{0:D2}]" -f $k) }
    $filterParts += ("{0}[{1}:v]xfade=transition=slideleft:duration={2}:offset={3}{4}" -f `
            $prev, $k, (Num $Transition), (Num $offset), $outLabel)
    $prev = $outLabel.Trim('[', ']')
    $prev = "[$prev]"
}
$filterPathFinal = Join-Path $tmp "final_filter.txt"
WriteUtf8 $filterPathFinal ($filterParts -join ";`n")

$ffArgs = @("-y", "-hide_banner", "-loglevel", "error")
for ($i = 0; $i -lt $n; $i++) { $ffArgs += @("-i", (Join-Path $tmp ("scene_{0:D2}.mp4" -f ($i + 1)))) }
$ffArgs += @(
    "-/filter_complex", $filterPathFinal,
    "-map", "[vout]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-r", "$Fps", "-an",
    $outAbs
)
Write-Host "Montando video final..."
& $ffmpeg @ffArgs
if ($LASTEXITCODE -ne 0) { throw "Falha na montagem final." }

if (-not $KeepTemp) { Remove-Item -LiteralPath $tmp -Recurse -Force }

Write-Host ""
Write-Host "OK -> $outAbs"
