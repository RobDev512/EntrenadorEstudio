# EntrenadorEstudio - Iniciador de servidor local para Windows PowerShell.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$puerto = 8765
$url = "http://127.0.0.1:$puerto/"

$comando = Get-Command py -ErrorAction SilentlyContinue
if ($comando) {
    $ejecutable = $comando.Source
    $argumentos = @('-3', '-m', 'http.server', "$puerto", '--bind', '127.0.0.1')
} else {
    $comando = Get-Command python -ErrorAction SilentlyContinue
    if ($comando) {
        $ejecutable = $comando.Source
        $argumentos = @('-m', 'http.server', "$puerto", '--bind', '127.0.0.1')
    } else {
        Write-Host 'No se encontro Python. Abre index.html con Live Server en VS Code.' -ForegroundColor Yellow
        Read-Host 'Presiona Enter para salir'
        exit 1
    }
}

Write-Host 'Iniciando EntrenadorEstudio...' -ForegroundColor Cyan
$proceso = Start-Process -FilePath $ejecutable -ArgumentList $argumentos -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Hidden
try {
    Start-Sleep -Seconds 2
    if ($proceso.HasExited) { throw 'El servidor no pudo iniciarse. Puede que el puerto 8765 este ocupado.' }
    Start-Process $url
    Write-Host "Pagina abierta: $url" -ForegroundColor Green
    Write-Host 'Manten esta ventana abierta mientras estudias.'
    Read-Host 'Cuando termines, presiona Enter para cerrar el servidor'
} finally {
    if (!$proceso.HasExited) { Stop-Process -Id $proceso.Id -ErrorAction SilentlyContinue }
}
