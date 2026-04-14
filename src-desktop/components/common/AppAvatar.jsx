import { useState } from 'react';
import { User01 } from '@untitledui/icons';
import { cn } from '../../lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

/**
 * Derives a two-character uppercase initial string from a name or email.
 *
 * If the source contains multiple words, uses the first character of the first two words; if it is a single word, uses its first two characters. Returns an empty string when neither name nor email is provided.
 * @param {string} name - Full name to derive initials from.
 * @param {string} email - Email used as fallback when name is not provided.
 * @returns {string} Two-character uppercase initials, or an empty string if no source is available.
 */
function getInitials(name, email) {
  const source = (name || email || '').trim();
  if (!source) return '';

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * Render a circular avatar that displays an image if available, otherwise shows initials derived from `name`/`email`, and falls back to a generic user icon.
 *
 * @param {Object} props - Component props.
 * @param {string} [props.src] - Image URL for the avatar.
 * @param {string} [props.name] - User name used to generate initials when image is not shown.
 * @param {string} [props.email] - User email used to generate initials when `name` is not provided.
 * @param {string} [props.alt] - Explicit image alt text; defaults to `name`, `email`, or `'User avatar'` when omitted.
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Avatar size key that selects Tailwind size classes.
 * @param {string} [props.className] - Additional classes applied to the outer container.
 * @param {string} [props.imgClassName] - Additional classes applied to the `<img>` element.
 * @param {string} [props.referrerPolicy='no-referrer'] - `referrerPolicy` passed to the `<img>` element.
 * @returns {JSX.Element} A JSX element rendering the circular avatar with the described fallback behavior.
 */
export default function AppAvatar({
  src,
  name,
  email,
  alt,
  size = 'md',
  className,
  imgClassName,
  referrerPolicy = 'no-referrer',
}) {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(src) && !imageError;
  const initials = getInitials(name, email);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center',
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt || name || email || 'User avatar'}
          className={cn('w-full h-full object-cover', imgClassName)}
          onError={() => setImageError(true)}
          referrerPolicy={referrerPolicy}
        />
      ) : initials ? (
        <span className="font-bold uppercase">{initials}</span>
      ) : (
        <User01 className="w-[55%] h-[55%]" />
      )}
    </div>
  );
}
