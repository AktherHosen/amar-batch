<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeUserRoleRequest extends FormRequest
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
            'role' => ['required', Rule::in($assignableRoles)],
        ];
    }
}