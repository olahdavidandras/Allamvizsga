<!DOCTYPE html>
<html lang="hu">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Képjavítás és Színezés</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
<body>
    <div id="app"></div>
</body>
</html>