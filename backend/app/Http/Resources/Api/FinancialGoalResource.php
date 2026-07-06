<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinancialGoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $targetAmount = (float) $this->target_amount;
        $currentAmount = (float) $this->current_amount;
        $progress = $targetAmount > 0 ? min(100, round(($currentAmount / $targetAmount) * 100, 2)) : 0;
        $remaining = max(0, $targetAmount - $currentAmount);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'target_amount' => (float) $this->target_amount,
            'current_amount' => (float) $this->current_amount,
            'remaining_amount' => $remaining,
            'deadline' => $this->deadline ? $this->deadline->toDateString() : null,
            'description' => $this->description,
            'status' => $this->status,
            'progress' => $progress,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
