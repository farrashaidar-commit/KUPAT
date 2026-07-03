<?php

namespace App\Http\Requests\Api;

class StoreTransactionRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'type' => ['required', 'string', 'in:income,expense'],
            'description' => ['nullable', 'string', 'max:500'],
            'transaction_date' => ['required', 'date'],
        ];
    }
}
