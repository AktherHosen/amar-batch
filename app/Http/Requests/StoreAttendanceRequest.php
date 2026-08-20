<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin() || $this->user()->isTeacher();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'batch_id' => ['required', Rule::exists('batches', 'id')->where('tenant_id', $tenantId)],
            'date' => 'required|date',
            'attendances' => 'required|array|min:1',
            'attendances.*.student_id' => ['required', Rule::exists('students', 'id')->where('tenant_id', $tenantId)],
            'attendances.*.status' => 'required|in:present,absent,late',
            'attendances.*.notes' => 'nullable|string',
        ];
    }
}
