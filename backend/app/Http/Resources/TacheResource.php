<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TacheResource extends JsonResource
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
            'titre' => $this->titre,
            'description' => $this->description,
            'statut' => $this->statut,
            'priorite' => $this->priorite,
            'projet_id' => $this->projet_id,
            'projet' => $this->whenLoaded('projet', function () {
                return [
                    'id' => $this->projet->id,
                    'nom' => $this->projet->nom,
                ];
            }),
            'assignes' => $this->whenLoaded('assignes', function () {
                return $this->assignes->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'nom' => $user->nom,
                        'email' => $user->email,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}