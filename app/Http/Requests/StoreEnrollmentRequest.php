<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin() || $this->user()->isTeacher();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'enrolled_at' => 'nullable|date',
        ];
    }
}
