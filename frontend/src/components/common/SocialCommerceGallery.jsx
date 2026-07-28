import React from 'react';

const UGC_POSTS = [
  { id: 1, user: '@sophie.haute', image: '/assets/images/placeholder.jpg', title: 'Soirée Gala avec Caftan HAFROSE' },
  { id: 2, user: '@leila_style', image: '/assets/images/placeholder.jpg', title: 'Essence d’Orient Haute Parfumerie' },
  { id: 3, user: '@claire_paris', image: '/assets/images/placeholder.jpg', title: 'Détail Cuir d’Autruche' },
];

const SocialCommerceGallery = () => {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-amber-600 font-bold">Social Commerce & UGC</span>
        <h2 className="font-serif text-3xl text-neutral-900 dark:text-amber-100 mt-2">Porté par notre Communauté</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto mt-2">Partagez vos moments d'exception avec le hashtag #HafrosePrivilege</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {UGC_POSTS.map((post) => (
          <div key={post.id} className="relative rounded-2xl overflow-hidden group shadow-lg">
            <img src={post.image} alt={post.title} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              <span className="text-amber-400 font-mono text-xs">{post.user}</span>
              <p className="text-white text-sm font-serif">{post.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialCommerceGallery;
