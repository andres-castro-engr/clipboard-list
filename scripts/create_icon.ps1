Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

function Add-RoundedRect($path, $x, $y, $w, $h, $r) {
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
}

# 1. Background squircle
$bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $bgPath 8 8 240 240 52

$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(8, 8)),
    (New-Object System.Drawing.Point(248, 248)),
    [System.Drawing.Color]::FromArgb(255, 30, 41, 59),
    [System.Drawing.Color]::FromArgb(255, 15, 23, 42)
)
$g.FillPath($bgBrush, $bgPath)

# Subtle background border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 99, 102, 241), 3)
$g.DrawPath($borderPen, $bgPath)

# 2. Shadow under clipboard
$shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $shadowPath 53 65 142 165 16
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 0, 0, 0))
$g.FillPath($shadowBrush, $shadowPath)

# 3. Main Clipboard Board
$boardPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $boardPath 50 60 142 165 16
$boardBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(50, 60)),
    (New-Object System.Drawing.Point(192, 225)),
    [System.Drawing.Color]::FromArgb(255, 255, 255, 255),
    [System.Drawing.Color]::FromArgb(255, 241, 245, 249)
)
$g.FillPath($boardBrush, $boardPath)

# 4. Clipboard Clip (Top)
$clipShadow = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $clipShadow 91 46 60 28 8
$clipShadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
$g.FillPath($clipShadowBrush, $clipShadow)

$clipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $clipPath 92 44 58 26 8
$clipBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(92, 44)),
    (New-Object System.Drawing.Point(150, 70)),
    [System.Drawing.Color]::FromArgb(255, 59, 130, 246),
    [System.Drawing.Color]::FromArgb(255, 99, 102, 241)
)
$g.FillPath($clipBrush, $clipPath)

# Clip inner hole
$clipHole = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $clipHole 111 50 20 8 4
$holeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 241, 245, 249))
$g.FillPath($holeBrush, $clipHole)

# 5. List items on clipboard (representing 10-item list)
$colors = @(
    [System.Drawing.Color]::FromArgb(255, 59, 130, 246),
    [System.Drawing.Color]::FromArgb(255, 99, 102, 241),
    [System.Drawing.Color]::FromArgb(255, 168, 85, 247),
    [System.Drawing.Color]::FromArgb(255, 236, 72, 153)
)
$widths = @(82, 68, 76, 56)
$yOffsets = @(88, 114, 140, 166)

for ($i = 0; $i -lt 4; $i++) {
    $y = $yOffsets[$i]
    $dotBrush = New-Object System.Drawing.SolidBrush($colors[$i])
    $g.FillEllipse($dotBrush, 68, ($y - 2), 12, 12)
    
    $linePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    Add-RoundedRect $linePath 88 $y $widths[$i] 8 4
    $lineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 203, 213, 225))
    $g.FillPath($lineBrush, $linePath)
}

# 6. Badge in bottom right corner with "10"
$badgePath = New-Object System.Drawing.Drawing2D.GraphicsPath
Add-RoundedRect $badgePath 152 165 76 46 16
$badgeBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(152, 165)),
    (New-Object System.Drawing.Point(228, 211)),
    [System.Drawing.Color]::FromArgb(255, 59, 130, 246),
    [System.Drawing.Color]::FromArgb(255, 139, 92, 246)
)
$g.FillPath($badgeBrush, $badgePath)
$badgeBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), 3)
$g.DrawPath($badgeBorder, $badgePath)

# Badge text "10"
$font = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$stringFormat = New-Object System.Drawing.StringFormat
$stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
$stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$rect = New-Object System.Drawing.RectangleF(152, 164, 76, 46)
$g.DrawString("10", $font, $textBrush, $rect, $stringFormat)

# Ensure images dir exists
if (-not (Test-Path "images")) {
    New-Item -ItemType Directory -Path "images" | Out-Null
}

$bmp.Save("images/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully generated images/icon.png"
