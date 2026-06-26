<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{
    protected $model = Contact::class;

    private static array $contactsData = [
        [
            'subject' => 'Demande d\'information produit',
            'message' => 'Bonjour, je souhaiterais obtenir des précisions concernant le chronographe automatique héritage. Est-il disponible avec un cadran noir ? En vous remerciant pour votre retour. Cordialement.'
        ],
        [
            'subject' => 'Proposition de partenariat d\'influence',
            'message' => 'Chère équipe Hafrose, je suis une créatrice de contenu spécialisée dans la mode éco-responsable et le luxe. J\'admire beaucoup vos créations et j\'aimerais vous proposer une collaboration pour ma prochaine campagne. Seriez-vous intéressés par un échange ?'
        ],
        [
            'subject' => 'Suivi de commande',
            'message' => 'Bonjour, j\'ai effectué une commande hier pour le bracelet jonc plaqué or. Je souhaiterais savoir si le colis a déjà été expédié et si je recevrai un numéro de suivi. Merci infiniment pour votre réactivité.'
        ],
        [
            'subject' => 'Question sur la livraison à l\'international',
            'message' => 'Bonjour, je réside actuellement à Tokyo et je suis absolument conquise par votre sac à main Cabas en cuir d\'autruche. Proposez-vous la livraison sécurisée vers le Japon ? Si oui, quels sont les délais moyens et les frais de douane ?'
        ],
        [
            'subject' => 'Demande de collaboration presse',
            'message' => 'Bonjour, rédacteur en chef pour un magazine de mode haut de gamme, nous préparons un éditorial pour l\'automne sur les accessoires d\'exception. Nous serions ravis de présenter certains de vos modèles. Serait-il possible d\'échanger avec votre service presse ?'
        ]
    ];

    private static int $index = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        if (self::$index < count(self::$contactsData)) {
            $contact = self::$contactsData[self::$index++];
            return [
                'name' => $this->faker->name(),
                'email' => $this->faker->safeEmail(),
                'phone' => $this->faker->phoneNumber(),
                'subject' => $contact['subject'],
                'message' => $contact['message'],
                'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            ];
        }

        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'subject' => $this->faker->randomElement(['Demande d\'information', 'Service après-vente', 'Retours et remboursements']),
            'message' => $this->faker->paragraph(3),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
