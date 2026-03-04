<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'description' => $this->description,
            'couleur' => $this->couleur,
            'createur_id' => $this->createur_id,
            'createur' => $this->whenLoaded('createur', function () {
                return [
                    'id' => $this->createur->id,
                    'nom' => $this->createur->nom,
                    'email' => $this->createur->email,
                ];
            }),
            'nombre_taches' => $this->whenCounted('taches'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}