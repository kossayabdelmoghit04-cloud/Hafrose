import { Instagram, Heart } from 'lucide-react';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';

const INSTAGRAM_POSTS = [
  { id: 1, tag: '@hafrose_official', likes: '1.2k', bg: 'from-burgundy-800 to-rose-700' },
  { id: 2, tag: '@hafrose_official', likes: '2.4k', bg: 'from-rose-700 to-gold-600' },
  { id: 3, tag: '@hafrose_official', likes: '980', bg: 'from-neutral-900 to-burgundy-900' },
  { id: 4, tag: '@hafrose_official', likes: '3.1k', bg: 'from-gold-600 to-burgundy-700' },
];

export const InstagramInspirationSection = () => (
  <Section spacing="lg" bg="white">
    <Container>
      {/* Section Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 text-burgundy-500 font-sans text-body-sm font-semibold tracking-luxury uppercase">
          <Instagram className="w-4 h-4" /> #HAFROSEstyle
        </div>
        <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950">
          Inspiration Instagram
        </h2>
        <p className="text-body-base text-neutral-500 max-w-md mx-auto">
          Rejoignez la communauté @hafrose_official et partagez vos plus beaux looks.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INSTAGRAM_POSTS.map((post) => (
          <div
            key={post.id}
            className={`group relative aspect-square rounded-md overflow-hidden bg-gradient-to-br ${post.bg} cursor-pointer shadow-hafrose-xs hover:shadow-hafrose-hover transition-all duration-350 ease-luxury`}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <Instagram className="w-8 h-8 text-white/80 group-hover:scale-110 transition-transform duration-350" />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col items-center justify-center gap-2 text-white">
              <span className="text-body-sm font-medium">{post.tag}</span>
              <div className="flex items-center gap-1.5 text-caption font-semibold">
                <Heart className="w-4 h-4 fill-white text-white" /> {post.likes}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  </Section>
);
