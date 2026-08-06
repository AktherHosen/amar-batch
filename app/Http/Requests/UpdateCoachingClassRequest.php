<?php

namespace App\Http\Requests;

use App\Models\CoachingClass;
use Illuminate\Foundation\Http\FormRequest;

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

        return [
            'name' => ['required', 'string', 'max:255', 'unique:coaching_classes,name,'.$coachingClass->id],
            'default_fee' => ['required', 'numeric', 'min:0'],
        ];
    }
}
