<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Feltöltés</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-lg">
        <h2 class="text-2xl font-bold mb-4">Új bejegyzés</h2>

        @if(session('success'))
            <p class="text-green-500">{{ session('success') }}</p>
        @endif

        <form action="{{ route('post.store') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
            @csrf
            <div>
                <label class="block font-semibold">Cím:</label>
                <input type="text" name="title" class="w-full border p-2 rounded" required>
            </div>

            <div>
                <label class="block font-semibold">Tartalom:</label>
                <textarea name="content" class="w-full border p-2 rounded"></textarea>
            </div>

            <div>
                <label class="block font-semibold">Kép:</label>
                <input type="file" name="image" class="w-full border p-2 rounded">
            </div>

            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Feltöltés</button>
        </form>

        <h2 class="text-xl font-bold mt-6">Bejegyzések</h2>

        @foreach($posts as $post)
            <div class="mt-4 p-4 border rounded-lg bg-gray-50">
                <h3 class="text-lg font-semibold">{{ $post->title }}</h3>
                <p>{{ $post->content }}</p>

                @if($post->getFirstMediaUrl('images'))
                    <img src="{{ $post->getFirstMediaUrl('images') }}" class="mt-2 w-48 rounded">
                    <form action="{{ route('post.deleteImage', $post->id) }}" method="POST" class="mt-2">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded">Kép törlése</button>
                    </form>
                @endif
            </div>
        @endforeach
    </div>
</body>
</html>
