import React from 'react';

const AvatarPlaceholder = ({
  gamertag,
  size = 'w-full h-full',
  className = '',
  showInitials = true
}) => {
  // Generate a consistent color based on gamertag
  const getColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Create gradient colors based on hash
    const colors = [
      'from-purple-600 to-blue-600',
      'from-pink-600 to-purple-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-blue-600',
      'from-yellow-600 to-orange-600',
      'from-red-600 to-pink-600',
      'from-indigo-600 to-purple-600',
      'from-teal-600 to-green-600',
      'from-orange-600 to-red-600',
      'from-cyan-600 to-blue-600',
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from gamertag
  const getInitials = (name) => {
    if (!name) return '??';

    // Handle cases with spaces or special characters
    const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words[0] && words[0].length >= 2) {
      return (words[0][0] + words[0][1]).toUpperCase();
    } else if (words[0]) {
      return words[0][0].toUpperCase();
    }

    return '??';
  };

  const gradient = getColorFromString(gamertag || 'default');
  const initials = getInitials(gamertag);

  return (
    <div className={`${size} ${className} bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gaming controller icon */}
      <div className="absolute top-2 right-2 opacity-20">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.97 16.06c.28 0 .57-.06.84-.18l3.19-1.41 3.19 1.41c.27.12.56.18.84.18.82 0 1.54-.5 1.85-1.28l1.93-4.83c.46-1.16-.25-2.45-1.48-2.45H20c-.55 0-1-.45-1-1s.45-1 1-1h1.33c1.23 0 1.94-1.29 1.48-2.45L20.88 1.62C20.57 1.06 19.85.6 19.03.6H4.97c-.82 0-1.54.46-1.85 1.02L1.19 6.45C.73 7.61 1.44 8.9 2.67 8.9H4c.55 0 1 .45 1 1s-.45 1-1 1H2.67c-1.23 0-1.94 1.29-1.48 2.45l1.93 4.83c.31.78 1.03 1.28 1.85 1.28z"/>
        </svg>
      </div>

      {/* Main content */}
      {showInitials ? (
        <div className="text-white font-bold text-center z-10">
          <div className="text-2xl md:text-3xl lg:text-4xl drop-shadow-lg">
            {initials}
          </div>
          <div className="text-xs md:text-sm opacity-80 mt-1 font-semibold tracking-wider">
            PLAYER
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center z-10">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
    </div>
  );
};

export default AvatarPlaceholder;