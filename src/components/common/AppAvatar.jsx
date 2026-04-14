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
 * Compute up to two-letter uppercase initials derived from a display name or email.
 *
 * If a name is provided it is used first; otherwise the email is used. For a single
 * word source, the first two characters are returned. For multi-word sources, the
 * first character of the first two words are returned. Returns an empty string if
 * neither input contains usable characters.
 *
 * @param {string} [name] - Optional display name to derive initials from.
 * @param {string} [email] - Optional email used as a fallback when `name` is empty.
 * @returns {string} The initials in uppercase, or an empty string if none can be derived.
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
 * Render a circular avatar that displays an image if available, otherwise shows initials derived from `name` or `email`, and falls back to a placeholder icon.
 *
 * @param {Object} props - Component props.
 * @param {string} [props.src] - Image URL for the avatar.
 * @param {string} [props.name] - User name used to derive initials when image is unavailable.
 * @param {string} [props.email] - User email used to derive initials when `name` is not provided.
 * @param {string} [props.alt] - Alt text for the image; falls back to `name`, then `email`, then `'User avatar'`.
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Visual size of the avatar; selects predefined size classes.
 * @param {string} [props.className] - Additional classes applied to the avatar container.
 * @param {string} [props.imgClassName] - Additional classes applied to the `<img>` element.
 * @param {string} [props.referrerPolicy='no-referrer'] - `referrerPolicy` forwarded to the `<img>` element.
 * @returns {JSX.Element} A React element representing the avatar.
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
