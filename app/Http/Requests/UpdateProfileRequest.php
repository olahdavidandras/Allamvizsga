<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bio'              => 'nullable|string|max:1000',
            'profile_picture'  => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'website'          => 'nullable|url',
        ];
    }
    
}
