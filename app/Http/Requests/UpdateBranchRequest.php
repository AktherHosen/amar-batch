<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\PhoneNumber;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', new PhoneNumber],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
