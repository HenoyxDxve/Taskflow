<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InscriptionRequest extends FormRequest
{
    public function autoriser()
    {
        return true;
    }

    public function regles()
    {
        return [
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'mot_de_passe' => 'required|min:6|confirmed',
        ];
    }
}