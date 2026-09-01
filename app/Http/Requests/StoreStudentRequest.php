<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $tenantId = app('tenant_id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'coaching_class_id' => ['required', Rule::exists('coaching_classes', 'id')->where('tenant_id', $tenantId)],
            'section' => ['nullable', 'string', 'max:10'],
            'address' => ['nullable', 'string'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'in:active,inactive,paused'],
            'joined_at' => ['nullable', 'date'],
            'left_at' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'create_parent_login' => ['sometimes', 'boolean'],
            'parent_email' => ['required_if:create_parent_login,true', 'nullable', 'email', 'unique:users,email'],
            'parent_password' => ['required_if:create_parent_login,true', 'nullable', 'string', 'min:6'],
        ];
    }
}
