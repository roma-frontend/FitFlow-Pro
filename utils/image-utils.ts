// utils/image-utils.ts
export function getAvatarUrl(name: string, fallbackUrl?: string) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
    
  return fallbackUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0ea5e9&color=fff&size=128`;
}

export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  const name = img.getAttribute('data-name') || 'User';
  
  // Fallback к ui-avatars если Cloudinary не работает
  if (!img.src.includes('ui-avatars.com')) {
    img.src = getAvatarUrl(name);
  } else {
    // Последний fallback - простое SVG
    img.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" fill="#0ea5e9"/>
        <text x="64" y="64" text-anchor="middle" dy=".3em" fill="white" font-family="Arial, sans-serif" font-size="48">
          ${name.charAt(0).toUpperCase()}
        </text>
      </svg>
    `);
  }
}
