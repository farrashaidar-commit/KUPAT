<?php

namespace App\Http\Requests\Api;

class StoreFinancialGoalRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,completed'],
        ];
    }
}
