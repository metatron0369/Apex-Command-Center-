export function getDomainFromUrl(url: string): string {
  try {
    let cleanedUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = 'https://' + cleanedUrl;
    }
    const parsed = new URL(cleanedUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    // If not a full URL, attempt simple split
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : url;
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function getDeterministicGradient(name: string): string {
  // Hash function to get index
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const gradients = [
    'from-rose-500 to-amber-500',
    'from-emerald-500 to-teal-550',
    'from-blue-600 to-indigo-600',
    'from-violet-600 to-purple-600',
    'from-amber-400 to-orange-500',
    'from-fuchsia-600 to-pink-600',
    'from-cyan-500 to-blue-500',
    'from-emerald-400 to-cyan-500',
  ];
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
