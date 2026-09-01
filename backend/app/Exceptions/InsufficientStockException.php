<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(
        public readonly string $productName,
        public readonly int $availableStock,
        string $message = '',
    ) {
        $msg = $message ?: "Le stock est insuffisant pour le produit : {$productName}";
        parent::__construct($msg, 409);
    }
}
