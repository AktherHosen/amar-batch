<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeeStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'batch_id' => 'required|exists:batches,id',
            'amount_paid' => 'required|numeric|min:0',
            'amount_due' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'status' => 'required|in:paid,partial,unpaid',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ];
    }
}
