<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCoachingClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:coaching_classes,name,'.$this->route('coaching_class')->id],
            'default_fee' => ['required', 'numeric', 'min:0'],
        ];
    }
}
