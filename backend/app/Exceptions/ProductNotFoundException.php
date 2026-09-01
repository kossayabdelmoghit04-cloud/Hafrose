<?php

namespace App\Exceptions;

use RuntimeException;

class ProductNotFoundException extends RuntimeException
{
    public function __construct(
        public readonly int|string $productId,
        string $message = '',
    ) {
        $msg = $message ?: "Le produit avec l'ID {$productId} n'existe pas.";
        parent::__construct($msg, 404);
    }
}
