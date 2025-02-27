<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use BenBjurstrom\Replicate\Replicate;

class ReplicateController extends Controller
{
    public function enhanceImage(Request $request)
    {
        $image = $request->file('image');
        $imagePath = $image->store('images', 'public');

        $version = '5c7d5dc6dd8bf75c1acaa8565735e7986bc5b66206b55cca93cb72c9bf15ccaa';
        $input = ['image' => asset('storage/' . $imagePath)];

        $replicate = app(Replicate::class);

        try {
            $data = $replicate->predictions()->create($version, $input);

            return response()->json([
                'status' => 'success',
                'prediction' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
