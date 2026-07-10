Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$size,
        [string]$filename,
        [string]$text,
        [int]$fontSize,
        [int]$x,
        [int]$y
    )
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Background: Tailwind blue-600 #2563eb
    $bgColor = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)
    $g.Clear($bgColor)
    
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    # Basic text formatting
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $g.DrawString($text, $font, $brush, $rect, $stringFormat)
    
    $bmp.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $filename"
}

$publicPath = "c:\Users\daaguilera\AppData\Local\GitHubDesktop\app-3.6.2\quantum-life-manager\public"

Create-Icon -size 512 -filename "$publicPath\icon-512.png" -text "Q" -fontSize 250 -x 130 -y 80
Create-Icon -size 192 -filename "$publicPath\icon-192.png" -text "Q" -fontSize 90 -x 50 -y 30
Create-Icon -size 512 -filename "$publicPath\maskable-icon-512.png" -text "Q" -fontSize 250 -x 130 -y 80
Create-Icon -size 192 -filename "$publicPath\maskable-icon-192.png" -text "Q" -fontSize 90 -x 50 -y 30
Create-Icon -size 180 -filename "$publicPath\apple-touch-icon.png" -text "Q" -fontSize 90 -x 45 -y 25
