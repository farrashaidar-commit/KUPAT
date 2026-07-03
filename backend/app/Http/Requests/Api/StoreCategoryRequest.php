<?php

namespace App\Http\Requests\Api;

class StoreCategoryRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:income,expense'],
            'color' => ['sometimes', 'string', 'max:7', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'icon' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
