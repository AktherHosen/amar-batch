<?php

namespace App\Http\Requests;

use App\Models\CoachingClass;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCoachingClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        /** @var CoachingClass $coachingClass */
        $coachingClass = $this->route('coaching_class');
        $tenantId = app('tenant_id');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('coaching_classes', 'name')->where('tenant_id', $tenantId)->ignore($coachingClass->id)],
            'default_fee' => ['required', 'numeric', 'min:0'],
        ];
    }
}
