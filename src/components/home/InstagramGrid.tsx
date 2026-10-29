import { Camera } from 'lucide-react';
import type { InstagramPost } from '@/types';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  const { settings } = useSiteSettings();
  if (posts.length === 0) return null;

  const instagramUrl = `https://www.instagram.com/${settings.instagram_handle.replace('@', '')}/`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-ink-900 shrink-0 flex items-center justify-center border border-ink-700">
            {settings.instagram_profile_image_url ? (
              <img src={settings.instagram_profile_image_url} alt={`Perfil ${settings.instagram_handle}`} className="w-full h-full object-cover" />
            ) : (
              <Camera size={18} className="text-ink-500" />
            )}
          </div>
          <div>
            <span className="eyebrow">Comunidade</span>
            <h2 className="text-display text-3xl sm:text-4xl mt-1">Siga no Instagram</h2>
          </div>
        </div>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-2 text-sm text-ink-300 hover:text-bone-50"
        >
          {settings.instagram_handle}
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {posts.map(post => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-md bg-ink-900"
          >
            <img src={post.image_url} alt={post.caption ?? ''} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/30 transition-colors flex items-center justify-center">
              <Camera size={22} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
