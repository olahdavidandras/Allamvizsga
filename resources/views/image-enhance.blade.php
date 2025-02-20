<!DOCTYPE html>
<html lang="hu">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Képjavítás és Színezés</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-100 p-8">
<div class="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Kép feltöltése</h2>
    <form id="uploadForm" action="{{ route('image.upload') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
        @csrf
        <input type="file" id="imageUpload" name="image" class="w-full border p-2 rounded" required>
        <button type="submit" id="uploadButton" class="bg-green-500 text-white px-4 py-2 rounded">Feltöltés</button>
    </form>
    <div id="uploadedImageUrl" class="mt-4"></div>

    <h2 class="text-xl font-bold mt-6">Képjavító API (GFPGAN)</h2>
    <input type="text" id="enhanceImageUrl" placeholder="Illeszd be a kép URL-t" class="w-full border p-2 rounded mb-2">
    <button id="enhanceButton" class="bg-blue-500 text-white px-4 py-2 rounded">Képjavítás</button>

    <h2 class="text-xl font-bold mt-6">Fekete-fehér színező API (DDColor)</h2>
    <input type="text" id="colorizeImageUrl" placeholder="Illeszd be a fekete-fehér kép URL-t" class="w-full border p-2 rounded mb-2">
    <button id="colorizeButton" class="bg-purple-500 text-white px-4 py-2 rounded">Színezés</button>

    <div id="loading" style="display:none;">Feldolgozás...</div>
    <div id="result"></div>
</div>

<script>
    $(document).ready(function () {
        $('#uploadForm').submit(function(e) {
            e.preventDefault();
            let formData = new FormData(this);

            $.ajax({
                url: "{{ route('image.upload') }}",
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    $('#enhanceImageUrl').val(response.url);
                    $('#colorizeImageUrl').val(response.url);
                    alert('Kép feltöltve!');
                },
                error: function(xhr) {
                    alert('Hiba a feltöltés során: ' + xhr.responseJSON.message);
                }
            });
        });

        function sendRequest(imageUrl, apiType) {
            $('#loading').show();
            $('#result').html('');
            $.ajaxSetup({
                headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}
            });
            $.post('/enhance', {image_url: imageUrl, api_type: apiType}, function (response) {
                $('#loading').hide();
                if (response.prediction_id) checkResult(response.prediction_id);
                else $('#result').html('<p>Hiba történt!</p>');
            });
        }

        function checkResult(predictionId) {
            setTimeout(function () {
                $.post('/check-status', {prediction_id: predictionId}, function (data) {
                    if (data.status === 'succeeded' && data.output) {
                        let outputImage = Array.isArray(data.output) ? data.output[0] : data.output;
                        $('#result').html('<h3>Eredmény:</h3><img src="' + outputImage + '" width="400">');
                    } else if (data.status === 'processing') {
                        checkResult(predictionId);
                    } else {
                        $('#result').html('<p>Nem sikerült a feldolgozás.</p>');
                    }
                });
            }, 5000);
        }

        $('#enhanceButton').click(function () {
            let imageUrl = $('#enhanceImageUrl').val();
            if (imageUrl) sendRequest(imageUrl, 'gfpgan');
            else alert('Adj meg egy kép URL-t!');
        });

        $('#colorizeButton').click(function () {
            let imageUrl = $('#colorizeImageUrl').val();
            if (imageUrl) sendRequest(imageUrl, 'ddcolor');
            else alert('Adj meg egy fekete-fehér kép URL-t!');
        });
    });
</script>
</body>
</html>
