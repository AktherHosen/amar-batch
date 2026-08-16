<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $assignableRoles = Role::query()
            ->where('tenant_id', $this->user()->tenant_id)
            ->where('slug', '!=', 'owner')
            ->pluck('slug')
            ->all();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('teacher'))],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', Rule::in($assignableRoles)],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ];
    }
}