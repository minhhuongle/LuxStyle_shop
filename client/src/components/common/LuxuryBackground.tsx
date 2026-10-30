import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface StarConfig {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  type: 'diamond4' | 'diamond8' | 'glint' | 'dust';
  opacity: number;
  color?: string;
}

export const LuxuryBackground: React.FC = () => {
  const { resolvedMode, palette } = useTheme();
  const isDark = resolvedMode === 'dark';

  // Tastefully placed constellation of luxury twinkling stars and diamond glints
  const stars: StarConfig[] = useMemo(
    () => [
      // Top hemisphere (Header & Hero ambiance)
      { id: 1, top: '4%', left: '12%', size: 14, duration: '4.2s', delay: '0s', type: 'diamond4', opacity: 0.85 },
      { id: 2, top: '7%', left: '88%', size: 18, duration: '5.1s', delay: '1.2s', type: 'diamond8', opacity: 0.9 },
      { id: 3, top: '12%', left: '32%', size: 10, duration: '3.6s', delay: '2.1s', type: 'diamond4', opacity: 0.75 },
      { id: 4, top: '15%', left: '74%', size: 16, duration: '4.8s', delay: '0.6s', type: 'diamond4', opacity: 0.8 },
      { id: 5, top: '19%', left: '8%', size: 12, duration: '6.0s', delay: '2.8s', type: 'diamond8', opacity: 0.7 },
      { id: 6, top: '22%', left: '92%', size: 11, duration: '3.9s', delay: '1.7s', type: 'diamond4', opacity: 0.85 },
      { id: 7, top: '27%', left: '48%', size: 15, duration: '5.5s', delay: '3.2s', type: 'diamond8', opacity: 0.9 },
      { id: 8, top: '29%', left: '20%', size: 9, duration: '4.0s', delay: '0.9s', type: 'glint', opacity: 0.65 },
      { id: 9, top: '34%', left: '82%', size: 13, duration: '4.7s', delay: '2.4s', type: 'diamond4', opacity: 0.8 },

      // Midground & Content area
      { id: 10, top: '42%', left: '5%', size: 16, duration: '5.8s', delay: '1.4s', type: 'diamond8', opacity: 0.75 },
      { id: 11, top: '46%', left: '94%', size: 12, duration: '4.4s', delay: '3.0s', type: 'diamond4', opacity: 0.8 },
      { id: 12, top: '51%', left: '15%', size: 10, duration: '3.8s', delay: '0.4s', type: 'glint', opacity: 0.7 },
      { id: 13, top: '56%', left: '86%', size: 17, duration: '5.2s', delay: '2.0s', type: 'diamond4', opacity: 0.85 },
      { id: 14, top: '61%', left: '28%', size: 14, duration: '4.9s', delay: '3.7s', type: 'diamond8', opacity: 0.75 },
      { id: 15, top: '66%', left: '72%', size: 11, duration: '3.7s', delay: '1.1s', type: 'diamond4', opacity: 0.8 },
      { id: 16, top: '72%', left: '10%', size: 15, duration: '5.6s', delay: '2.7s', type: 'diamond4', opacity: 0.7 },
      { id: 17, top: '77%', left: '90%', size: 18, duration: '6.2s', delay: '0.8s', type: 'diamond8', opacity: 0.85 },
      { id: 18, top: '83%', left: '40%', size: 12, duration: '4.3s', delay: '3.4s', type: 'diamond4', opacity: 0.75 },
      { id: 19, top: '88%', left: '22%', size: 10, duration: '3.9s', delay: '1.9s', type: 'glint', opacity: 0.65 },
      { id: 20, top: '93%', left: '78%', size: 14, duration: '5.0s', delay: '0.3s', type: 'diamond4', opacity: 0.8 },

      // Subtle Stardust Accents (Mini bokeh dust)
      { id: 21, top: '8%', left: '55%', size: 4, duration: '3.2s', delay: '1.0s', type: 'dust', opacity: 0.6 },
      { id: 22, top: '16%', left: '44%', size: 5, duration: '4.1s', delay: '2.5s', type: 'dust', opacity: 0.7 },
      { id: 23, top: '24%', left: '68%', size: 4, duration: '3.5s', delay: '0.5s', type: 'dust', opacity: 0.65 },
      { id: 24, top: '38%', left: '36%', size: 6, duration: '4.6s', delay: '1.8s', type: 'dust', opacity: 0.7 },
      { id: 25, top: '63%', left: '52%', size: 5, duration: '3.8s', delay: '3.1s', type: 'dust', opacity: 0.6 },
      { id: 26, top: '79%', left: '62%', size: 4, duration: '4.4s', delay: '0.7s', type: 'dust', opacity: 0.65 },
    ],
    []
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* 1. Base Velvet Atmosphere Gradient */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 0%, #0d0f18 0%, #08090e 55%, #050609 100%)'
            : 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f7f8fc 60%, #eef0f7 100%)',
        }}
      />

      {/* 2. Haute Couture Celestial Runway Spotlight (Top Center Beam) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-5xl h-[500px] pointer-events-none transition-all duration-700 opacity-60 dark:opacity-40 animate-gold-pulse"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${palette.primary}33 0%, ${palette.secondary}15 45%, transparent 80%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* 3. Hairline Golden Prismatic Ray on Top Viewport Edge */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-80 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${palette.secondary}40 20%, ${palette.primary} 50%, ${palette.secondary}40 80%, transparent 100%)`,
          boxShadow: `0 0 16px ${palette.primary}`,
        }}
      />

      {/* 4. Fluid Animated Aurora Glow Orbs */}
      {/* Orb 1: Upper Left (Primary Radiant Gold / Gem Accent) */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[850px] max-h-[850px] rounded-full blur-[130px] opacity-25 dark:opacity-35 pointer-events-none animate-float-1"
        style={{
          background: `radial-gradient(circle, ${palette.primary} 0%, ${palette.secondary}40 40%, transparent 75%)`,
        }}
      />

      {/* Orb 2: Upper Right (Champagne Warm Amber Glow) */}
      <div
        className="absolute top-[18%] -right-[15%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full blur-[150px] opacity-20 dark:opacity-30 pointer-events-none animate-float-2"
        style={{
          background: `radial-gradient(circle, ${palette.secondary} 0%, ${palette.primary}30 45%, transparent 75%)`,
        }}
      />

      {/* Orb 3: Lower Left (Atmospheric Velvet Deep Glow) */}
      <div
        className="absolute top-[55%] -left-[12%] w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full blur-[140px] opacity-15 dark:opacity-25 pointer-events-none animate-float-3"
        style={{
          background: `radial-gradient(circle, ${palette.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Orb 4: Bottom Center / Right (Soft Warm Grounding Halo) */}
      <div
        className="absolute -bottom-[20%] right-[15%] w-[48vw] h-[48vw] max-w-[750px] max-h-[750px] rounded-full blur-[160px] opacity-15 dark:opacity-20 pointer-events-none animate-float-1"
        style={{
          background: `radial-gradient(circle, ${palette.secondary} 0%, transparent 70%)`,
        }}
      />

      {/* 5. Haute Couture Diamond Guilloche Mesh Pattern with Radial Mask */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.065] transition-opacity duration-500"
        style={{
          backgroundImage: `
            linear-gradient(45deg, ${palette.primary} 1px, transparent 1px),
            linear-gradient(-45deg, ${palette.primary} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 35%, black 25%, transparent 85%)',
        }}
      />

      {/* 6. Sparkling "Lung Linh" Constellation of Diamond Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animation: `twinkleStar ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
              opacity: isDark ? star.opacity : star.opacity * 0.75,
            }}
          >
            {star.type === 'diamond8' ? (
              // 8-point Luxury Diamond Star
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                style={{
                  filter: `drop-shadow(0 0 ${star.size > 14 ? '6px' : '3px'} ${palette.primary})`,
                }}
              >
                <path
                  d="M12 0 L13.8 8.2 L22 10 L15.5 13.8 L18 22 L12 16.5 L6 22 L8.5 13.8 L2 10 L10.2 8.2 Z"
                  fill={star.color || (isDark ? palette.secondary : palette.primary)}
                />
              </svg>
            ) : star.type === 'diamond4' ? (
              // 4-point Haute Couture Star
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                style={{
                  filter: `drop-shadow(0 0 ${star.size > 13 ? '5px' : '2.5px'} ${palette.primary})`,
                }}
              >
                <path
                  d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z"
                  fill={star.color || (isDark ? '#FFF9E6' : palette.primary)}
                />
              </svg>
            ) : star.type === 'glint' ? (
              // Delicate Cross Glint (+)
              <svg
                viewBox="0 0 20 20"
                className="w-full h-full"
                style={{
                  filter: `drop-shadow(0 0 3px ${palette.primary})`,
                }}
              >
                <line x1="10" y1="2" x2="10" y2="18" stroke={palette.primary} strokeWidth="2" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" stroke={palette.primary} strokeWidth="2" strokeLinecap="round" />
                <circle cx="10" cy="10" r="2.5" fill="#ffffff" />
              </svg>
            ) : (
              // Mini Floating Luminous Stardust Dot
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: palette.secondary,
                  boxShadow: `0 0 8px 1px ${palette.primary}`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 7. Subtle Ambient Vignette Border Shade for Extra Depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: isDark
            ? 'inset 0 0 120px rgba(0, 0, 0, 0.7)'
            : 'inset 0 0 100px rgba(0, 0, 0, 0.04)',
        }}
      />
    </div>
  );
};

