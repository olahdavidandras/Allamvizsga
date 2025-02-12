<!DOCTYPE html>
<html lang="hu">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Képjavítás és Színezés</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>

<h2>Képjavító API (GFPGAN)</h2>
<input type="text" id="enhance-image-url" placeholder="Illeszd be a kép URL-t">
<button id="enhance-button">Képjavítás</button>

<h2>Fekete-fehér színező API (DDColor)</h2>
<input type="text" id="colorize-image-url" placeholder="Illeszd be a fekete-fehér kép URL-t">
<button id="colorize-button">Színezés</button>

<div id="loading" style="display:none;">Feldolgozás...</div>
<div id="result"></div>

<script>
    $(document).ready(function () {

        function sendRequest(imageUrl, apiType) {
            $('#loading').show();
            $('#result').html('');
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
            $.ajax({
                url: '/enhance',
                method: 'POST',
                data: {
                    image_url: imageUrl,
                    api_type: apiType,
                    _token: '{{ csrf_token() }}'
                },
                success: function (response) {
                    $('#loading').hide();
                    if (response.prediction_id) {
                        checkResult(response.prediction_id);
                    } else {
                        $('#result').html('<p>Hiba történt!</p>');
                    }
                },
                error: function (xhr) {
                    $('#loading').hide();
                    handleError(xhr);
                }
            });
        }

        function checkResult(predictionId) {
            setTimeout(function () {
                $.ajax({
                    url: '/check-status',
                    method: 'POST',
                    data: {
                        prediction_id: predictionId,
                        _token: '{{ csrf_token() }}'
                    },
                    success: function (data) {
                        if (data.status === 'succeeded' && data.output) {
                            let outputImage = Array.isArray(data.output) ? data.output[0] : data.output;
                            $('#result').html('<h3>Eredmény:</h3><img src="' + outputImage + '" width="400">');
                        } else if (data.status === 'processing') {
                            checkResult(predictionId);
                        } else {
                            $('#result').html('<p>Nem sikerült a feldolgozás.</p>');
                        }
                    },
                    error: function (xhr) {
                        $('#loading').hide();
                        handleError(xhr);
                    }
                });
            }, 5000);
        }

        function handleError(xhr) {
            let errorMessage = 'Hiba történt!';
            if (xhr.responseJSON) {
                errorMessage += '<br><strong>Státusz:</strong> ' + xhr.status;
                if (xhr.responseJSON.error) {
                    errorMessage += '<br><strong>Hiba:</strong> ' + xhr.responseJSON.error;
                }
                if (xhr.responseJSON.details) {
                    errorMessage += '<br><strong>Részletek:</strong> ' + JSON.stringify(xhr.responseJSON.details);
                }
            } else {
                errorMessage += '<br><strong>Hibakód:</strong> ' + xhr.status + ' - ' + xhr.statusText;
            }
            $('#result').html('<p>' + errorMessage + '</p>');
        }

        $('#enhance-button').click(function () {
            let imageUrl = $('#enhance-image-url').val();
            if (imageUrl) {
                sendRequest(imageUrl, 'gfpgan');
            } else {
                alert('Adj meg egy kép URL-t!');
            }
        });

        $('#colorize-button').click(function () {
            let imageUrl = $('#colorize-image-url').val();
            if (imageUrl) {
                sendRequest(imageUrl, 'ddcolor');
            } else {
                alert('Adj meg egy fekete-fehér kép URL-t!');
            }
        });
    });
</script>

</body>
</html>
