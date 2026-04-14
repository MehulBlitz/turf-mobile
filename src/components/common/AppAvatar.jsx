import { useState } from 'react';
import { User01 } from '@untitledui/icons';
import { cn } from '../../lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

function getInitials(name, email) {
  const source = (name || email || '').trim();
  if (!source) return '';

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

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
