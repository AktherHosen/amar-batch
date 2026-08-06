<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeeStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }
}
