<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture N° {{ $order->id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #111111;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            line-height: 1.5;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            background: #ffffff;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .header-table td {
            vertical-align: top;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #D4AF37;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .company-details {
            text-align: left;
            font-size: 12px;
            color: #7F7F7F;
        }
        .invoice-details {
            text-align: right;
        }
        .invoice-title {
            font-size: 22px;
            color: #111111;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 35px;
        }
        .details-table td {
            width: 50%;
            vertical-align: top;
            padding: 10px;
            border: 1px solid #F5F5F5;
            background-color: #FDFBF7;
        }
        .details-title {
            font-weight: bold;
            color: #8C6239;
            margin-bottom: 8px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #111111;
            color: #D4AF37;
            padding: 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
        }
        .items-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #F5F5F5;
        }
        .items-table tr:last-child td {
            border-bottom: 2px solid #111111;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .totals-table td {
            padding: 6px 10px;
        }
        .totals-table .label {
            text-align: right;
            font-weight: bold;
            color: #7F7F7F;
        }
        .totals-table .val {
            text-align: right;
            width: 150px;
        }
        .totals-table .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #111111;
            border-top: 2px double #D4AF37;
            padding-top: 10px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #7F7F7F;
            border-top: 1px solid #F5F5F5;
            padding-top: 15px;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 3px;
            text-transform: uppercase;
        }
        .status-pending { background-color: #FEF3C7; color: #D97706; }
        .status-confirmed { background-color: #DBEAFE; color: #2563EB; }
        .status-shipped { background-color: #E0F2FE; color: #0284C7; }
        .status-delivered { background-color: #D1FAE5; color: #059669; }
        .status-cancelled { background-color: #FEE2E2; color: #DC2626; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <!-- Logo & Header info -->
        <table class="header-table">
            <tr>
                <td>
                    <div class="logo">Hafrose</div>
                    <div class="company-details">
                        Boutique Artisanale de Luxe<br>
                        123 Rue de l'Artisanat, 75001 Paris<br>
                        contact@hafrose.com | +33 1 23 45 67 89
                    </div>
                </td>
                <td class="invoice-details">
                    <div class="invoice-title">FACTURE</div>
                    <strong>Commande N° :</strong> {{ $order->id }}<br>
                    <strong>Date :</strong> {{ $order->created_at->format('d/m/Y H:i') }}<br>
                    <strong>Statut :</strong> 
                    <span class="status-badge 
                        @if($order->status === 'En attente') status-pending
                        @elseif($order->status === 'Confirmée') status-confirmed
                        @elseif($order->status === 'Expédiée') status-shipped
                        @elseif($order->status === 'Livrée') status-delivered
                        @else status-cancelled
                        @endif">
                        {{ $order->status }}
                    </span>
                </td>
            </tr>
        </table>

        <!-- Billing & Shipping details -->
        <table class="details-table">
            <tr>
                <td>
                    <div class="details-title">Facturé à</div>
                    <strong>{{ $order->customer_name }}</strong><br>
                    Téléphone : {{ $order->phone }}
                </td>
                <td>
                    <div class="details-title">Adresse de Livraison</div>
                    {{ $order->address }}<br>
                    {{ $order->city }}
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description du Produit</th>
                    <th style="text-align: right; width: 100px;">Prix unitaire</th>
                    <th style="text-align: center; width: 80px;">Quantité</th>
                    <th style="text-align: right; width: 120px;">Montant</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->orderItems as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product ? $item->product->name : 'Produit supprimé' }}</strong>
                            @if($item->product && $item->product->color)
                                <div style="font-size: 11px; color: #7F7F7F; margin-top: 3px;">
                                    Couleur : {{ $item->product->color }} | Matière : {{ $item->product->material }}
                                </div>
                            @endif
                        </td>
                        <td style="text-align: right;">{{ number_format($item->unit_price, 2, ',', ' ') }} €</td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right; font-weight: bold;">{{ number_format($item->subtotal, 2, ',', ' ') }} €</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <table class="totals-table" align="right">
            <tr>
                <td class="label">Sous-total HT :</td>
                <td class="val">{{ number_format($order->total_price / 1.2, 2, ',', ' ') }} €</td>
            </tr>
            <tr>
                <td class="label">TVA (20%) :</td>
                <td class="val">{{ number_format($order->total_price - ($order->total_price / 1.2), 2, ',', ' ') }} €</td>
            </tr>
            <tr>
                <td class="label grand-total" style="padding-top: 10px;">Total TTC :</td>
                <td class="val grand-total" style="padding-top: 10px; color: #D4AF37;">{{ number_format($order->total_price, 2, ',', ' ') }} €</td>
            </tr>
        </table>

        <div style="clear: both;"></div>

        <!-- Footer -->
        <div class="footer">
            Merci de votre confiance et pour votre achat chez Hafrose.<br>
            Hafrose SAS - Capital de 10 000 € - RCS Paris B 123 456 789<br>
            TVA Intracommunautaire : FR 12 345 678 901
        </div>
    </div>
</body>
</html>
