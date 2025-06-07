<?php

namespace App\Http\Requests\Image;

use Illuminate\Foundation\Http\FormRequest;

class CheckStatusRequest extends FormRequest
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
        'prediction_id' => ['required', 'string'],
        'parent_id' => ['required', 'integer', 'exists:posts,id'],
        'ai_type' => ['required', 'in:gfpgan,ddcolor'],
    ];
}
}
