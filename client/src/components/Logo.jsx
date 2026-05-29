import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import logoPadded from '../assets/logo_padded.png';

// Props:
// - variant: 'segmented' | 'flagFull' | 'wordmark' | 'kenyaGradient' | 'greenGlow' | 'premium' | 'ultra' | 'image'
// - greenStyle: 'brandGradient' | 'flag' | 'premium'
// - glow: 'subtle' | 'strong' | 'off'
// - pulse: 'hover' | 'always' | 'off'
const Logo = ({
  className = "",
  isDark = true,
  responsiveCompact = false,
  variant = "segmented",
  greenStyle = 'brandGradient',
  glow = 'subtle',
  pulse = 'hover'
}) => {
  const baseColor = isDark ? 'text-white' : 'text-gray-900';
  const sizeClasses = className || 'text-xl sm:text-2xl lg:text-3xl';

  // Enhanced glow effects
  const glowStyle = useMemo(() => {
    if (glow === 'off') return {};

    if (glow === 'subtle') {
      return isDark
        ? {
          textShadow: '0 0 8px rgba(81,250,170,0.4), 0 0 16px rgba(81,250,170,0.2), 0 0 24px rgba(81,250,170,0.1)',
          filter: 'drop-shadow(0 0 4px rgba(81,250,170,0.3))'
        }
        : {
          textShadow: '0 0 4px rgba(81,250,170,0.3), 0 0 8px rgba(81,250,170,0.2)',
          filter: 'drop-shadow(0 0 2px rgba(81,250,170,0.2))'
        };
    }

    if (glow === 'strong') {
      return isDark
        ? {
          textShadow: '0 0 12px rgba(81,250,170,0.6), 0 0 24px rgba(81,250,170,0.4), 0 0 36px rgba(81,250,170,0.2)',
          filter: 'drop-shadow(0 0 8px rgba(81,250,170,0.5))'
        }
        : {
          textShadow: '0 0 8px rgba(81,250,170,0.5), 0 0 16px rgba(81,250,170,0.3)',
          filter: 'drop-shadow(0 0 4px rgba(81,250,170,0.4))'
        };
    }

    return {};
  }, [glow, isDark]);

  // Enhanced Kenya flag gradient with premium styling
  const kenyaGradient = useMemo(() => {
    const brandGreenStart = '#16a34a';
    const brandGreenEnd = '#22c55e';
    const flagRed = '#c1121f';
    const flagWhite = '#ffffff';
    const flagBlack = '#000000';

    if (greenStyle === 'premium') {
      return {
        background: `linear-gradient(135deg,
          ${flagBlack} 0%, ${flagBlack} 12%,
          ${flagWhite} 13%, ${flagWhite} 18%,
          ${flagRed} 19%, ${flagRed} 78%,
          ${flagWhite} 79%, ${flagWhite} 84%,
          ${brandGreenStart} 85%, ${brandGreenEnd} 100%
        )`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% auto',
        animation: 'kenyaShine 4s ease-in-out 5',
        position: 'relative',
        zIndex: 1,
      };
    }

    if (greenStyle === 'brandGradient') {
      return {
        background: `linear-gradient(90deg,
          ${flagBlack} 0%, ${flagBlack} 12%,
          ${flagWhite} 13%, ${flagWhite} 18%,
          ${flagRed} 19%, ${flagRed} 78%,
          ${flagWhite} 79%, ${flagWhite} 84%,
          ${brandGreenStart} 85%, ${brandGreenEnd} 100%
        )`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% auto',
        animation: 'kenyaShine 4s ease-in-out 5',
        position: 'relative',
        zIndex: 1,
      };
    }

    // Default flag colors
    return {
      background: `linear-gradient(90deg,
        ${flagBlack} 0%, ${flagBlack} 12%,
        ${flagWhite} 13%, ${flagWhite} 18%,
        ${flagRed} 19%, ${flagRed} 78%,
        ${flagWhite} 79%, ${flagWhite} 84%,
        #007a33 85%, #007a33 100%
      )`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundSize: '200% auto',
      animation: 'kenyaShine 4s ease-in-out 5',
      position: 'relative',
      zIndex: 1,
    };
  }, [greenStyle]);

  // Enhanced pulse animations
  const pulseAnimation = useMemo(() => {
    if (pulse === 'off') return {};

    if (pulse === 'hover') {
      return {
        whileHover: {
          scale: 1.05,
          transition: { duration: 0.3, ease: "easeOut" }
        },
        whileTap: {
          scale: 0.95,
          transition: { duration: 0.1 }
        },
      };
    }

    if (pulse === 'always') {
      return {
        animate: {
          scale: [1, 1.02, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }
      };
    }

    return {};
  }, [pulse]);

  const commonClasses = `font-bold tracking-tight ${className}`;

  if (responsiveCompact) {
    return (
      <motion.div
        className={`inline-flex items-baseline ${sizeClasses}`}
        style={glowStyle}
        {...pulseAnimation}
      >
        <span className={`font-bold tracking-tight sm:hidden ${baseColor}`}>BH</span>
        <span className="hidden sm:inline-flex items-baseline gap-1 sm:gap-1.5">
          {variant === 'segmented' ? (
            <>
              <span
                className="font-bold tracking-tight green-glow-text"
                style={{
                  background: `linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: isDark ? '0 0 20px rgba(81,250,170,0.6), 0 0 40px rgba(81,250,170,0.3)' : '0 0 15px rgba(81,250,170,0.4)',
                }}
              >
                Bumi
              </span>
              <span
                className="font-semibold tracking-tight kenya-gradient-text"
                style={{
                  background: `linear-gradient(135deg,
                    #000000 0%, #000000 12%,
                    #ffffff 13%, #ffffff 18%,
                    #c1121f 19%, #c1121f 78%,
                    #ffffff 79%, #ffffff 84%,
                    #16a34a 85%, #22c55e 100%
                  )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  animation: 'kenyaShine 4s ease-in-out 5',
                }}
              >
                House
              </span>
            </>
          ) : variant === 'flagFull' || variant === 'kenyaGradient' ? (
            <span
              className="font-bold tracking-tight kenya-gradient-text"
              style={kenyaGradient}
            >
              BumiHouse
            </span>
          ) : variant === 'greenGlow' ? (
            <>
              <span className={`font-bold tracking-tight ${baseColor}`}>Bumi</span>
              <span className={`font-semibold tracking-tight ${isDark ? 'text-white/90' : 'text-gray-800'}`}>House</span>
              <span className="font-bold tracking-tight green-glow-text" style={{
                background: `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}> House</span>
            </>
          ) : variant === 'premium' ? (
            <>
              <span
                className="font-bold tracking-tight premium-logo-text"
                style={{
                  background: `linear-gradient(135deg,
                    #000000 0%, #000000 15%,
                    #ffffff 16%, #ffffff 25%,
                    #c1121f 26%, #c1121f 75%,
                    #ffffff 76%, #ffffff 85%,
                    #2563eb 86%, #3b82f6 100%
                  )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  textShadow: isDark ? '0 0 20px rgba(81,250,170,0.3)' : '0 0 10px rgba(81,250,170,0.2)',
                }}
              >
                Bumi
              </span>
              <span
                className="font-semibold tracking-tight premium-logo-text"
                style={{
                  background: `linear-gradient(135deg,
                    #c1121f 0%, #c1121f 20%,
                    #ffffff 21%, #ffffff 30%,
                    #16a34a 31%, #22c55e 100%
                  )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  textShadow: isDark ? '0 0 20px rgba(81,250,170,0.3)' : '0 0 10px rgba(81,250,170,0.2)',
                }}
              >
                House
              </span>
            </>
          ) : variant === 'ultra' ? (
            <motion.div
              className="inline-flex items-baseline gap-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span
                className="font-bold tracking-tight logo-premium-glow"
                style={{
                  background: `linear-gradient(135deg,
                    #000000 0%, #000000 10%,
                    #ffffff 11%, #ffffff 20%,
                    #c1121f 21%, #c1121f 80%,
                    #ffffff 81%, #ffffff 90%,
                    #2563eb 91%, #3b82f6 100%
                  )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  textShadow: isDark ? '0 0 25px rgba(81,250,170,0.4), 0 0 50px rgba(81,250,170,0.2)' : '0 0 15px rgba(81,250,170,0.3)',
                  filter: 'drop-shadow(0 0 10px rgba(81,250,170,0.3))',
                }}
              >
                Bumi
              </span>
              <span
                className="font-semibold tracking-tight logo-premium-glow"
                style={{
                  background: `linear-gradient(135deg,
                    #c1121f 0%, #c1121f 15%,
                    #ffffff 16%, #ffffff 25%,
                    #16a34a 26%, #22c55e 100%
                  )`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% auto',
                  textShadow: isDark ? '0 0 25px rgba(81,250,170,0.4), 0 0 50px rgba(81,250,170,0.2)' : '0 0 15px rgba(81,250,170,0.3)',
                  filter: 'drop-shadow(0 0 10px rgba(81,250,170,0.3))',
                }}
              >
                House
              </span>
            </motion.div>
          ) : (
            <span className={`font-bold tracking-tight ${baseColor}`}>BumiHouse</span>
          )}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-baseline ${sizeClasses}`}
      style={glowStyle}
      {...pulseAnimation}
    >
      <span className={`font-bold tracking-tight sm:hidden ${baseColor}`}>BH</span>
      <span className="hidden sm:inline-flex items-baseline gap-1 sm:gap-1.5">
        {variant === 'segmented' ? (
          <>
            <span
              className="font-bold tracking-tight green-glow-text"
              style={{
                background: `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: isDark ? '0 0 20px rgba(81,250,170,0.6), 0 0 40px rgba(81,250,170,0.3)' : '0 0 15px rgba(81,250,170,0.4)',
              }}
            >
              Bumi
            </span>
            <span
              className="font-semibold tracking-tight kenya-gradient-text"
              style={{
                background: `linear-gradient(135deg,
                  #000000 0%, #000000 12%,
                  #ffffff 13%, #ffffff 18%,
                  #c1121f 19%, #c1121f 78%,
                  #ffffff 79%, #ffffff 84%,
                  #16a34a 85%, #22c55e 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                animation: 'kenyaShine 4s ease-in-out 5',
              }}
            >
              House
            </span>
          </>
        ) : variant === 'flagFull' || variant === 'kenyaGradient' ? (
          <span
            className="font-bold tracking-tight kenya-gradient-text"
            style={kenyaGradient}
          >
            BumiHouse
          </span>
        ) : variant === 'greenGlow' ? (
          <>
            <span className={`font-bold tracking-tight ${baseColor}`}>Bumi</span>
            <span className={`font-semibold tracking-tight ${isDark ? 'text-white/90' : 'text-gray-800'}`}>House</span>
            <span className="font-bold tracking-tight green-glow-text" style={{
              background: `linear-gradient(90deg, #16a34a 0%, #22c55e 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}></span>
          </>
        ) : variant === 'premium' ? (
          <>
            <span
              className="font-bold tracking-tight premium-logo-text"
              style={{
                background: `linear-gradient(135deg,
                  #000000 0%, #000000 15%,
                  #ffffff 16%, #ffffff 25%,
                  #c1121f 26%, #c1121f 75%,
                  #ffffff 76%, #ffffff 85%,
                  #16a34a 86%, #22c55e 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                textShadow: isDark ? '0 0 20px rgba(81,250,170,0.3)' : '0 0 10px rgba(81,250,170,0.2)',
              }}
            >
              Bumi
            </span>
            <span
              className="font-semibold tracking-tight premium-logo-text"
              style={{
                background: `linear-gradient(135deg,
                  #c1121f 0%, #c1121f 20%,
                  #ffffff 21%, #ffffff 30%,
                  #16a34a 31%, #22c55e 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                textShadow: isDark ? '0 0 20px rgba(81,250,170,0.3)' : '0 0 10px rgba(81,250,170,0.2)',
              }}
            >
              House
            </span>
          </>
        ) : variant === 'ultra' ? (
          <motion.div
            className="inline-flex items-baseline gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span
              className="font-bold tracking-tight logo-premium-glow"
              style={{
                background: `linear-gradient(135deg,
                  #000000 0%, #000000 10%,
                  #ffffff 11%, #ffffff 20%,
                  #c1121f 21%, #c1121f 80%,
                  #ffffff 81%, #ffffff 90%,
                  #16a34a 91%, #22c55e 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                textShadow: isDark ? '0 0 25px rgba(81,250,170,0.4), 0 0 50px rgba(81,250,170,0.2)' : '0 0 15px rgba(81,250,170,0.3)',
                filter: 'drop-shadow(0 0 10px rgba(81,250,170,0.3))',
              }}
            >
              Bumi
            </span>
            <span
              className="font-semibold tracking-tight logo-premium-glow"
              style={{
                background: `linear-gradient(135deg,
                  #c1121f 0%, #c1121f 15%,
                  #ffffff 16%, #ffffff 25%,
                  #16a34a 26%, #22c55e 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% auto',
                textShadow: isDark ? '0 0 25px rgba(81,250,170,0.4), 0 0 50px rgba(81,250,170,0.2)' : '0 0 15px rgba(81,250,170,0.3)',
                filter: 'drop-shadow(0 0 10px rgba(81,250,170,0.3))',
              }}
            >
              House
            </span>
          </motion.div>
        ) : variant === 'image' ? (
          <img
            src={logoPadded}
            alt="BumiHouse"
            className={`h-12 w-auto object-contain ${className}`}
          />
        ) : variant === 'wordmark' ? (
          <span className={`font-bold tracking-tight ${baseColor}`}>BumiHouse</span>
        ) : (
          <span className={`font-bold tracking-tight ${baseColor}`}>BumiHouse</span>
        )}
      </span>
    </motion.div >
  );
};

export default Logo;

// Add CSS animations for the Kenya flag gradient
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes kenyaShine {
      0% {
        background-position: -200% center;
        filter: brightness(1) contrast(1);
      }
      25% {
        background-position: -100% center;
        filter: brightness(1.1) contrast(1.05);
      }
      50% {
        background-position: 0% center;
        filter: brightness(1.2) contrast(1.1);
      }
      75% {
        background-position: 100% center;
        filter: brightness(1.1) contrast(1.05);
      }
      100% {
        background-position: 200% center;
        filter: brightness(1) contrast(1);
      }
    }
    
    @keyframes logoGlow {
      0%, 100% {
        filter: drop-shadow(0 0 4px rgba(81,250,170,0.3)) drop-shadow(0 0 8px rgba(81,250,170,0.1));
      }
      50% {
        filter: drop-shadow(0 0 8px rgba(81,250,170,0.6)) drop-shadow(0 0 16px rgba(81,250,170,0.3));
      }
    }
    
    @keyframes greenGlow {
      0%, 100% {
        filter: drop-shadow(0 0 6px rgba(81,250,170,0.4)) drop-shadow(0 0 12px rgba(81,250,170,0.2)) drop-shadow(0 0 24px rgba(81,250,170,0.1));
      }
      50% {
        filter: drop-shadow(0 0 10px rgba(81,250,170,0.7)) drop-shadow(0 0 20px rgba(81,250,170,0.4)) drop-shadow(0 0 40px rgba(81,250,170,0.2));
      }
    }
    
    @keyframes premiumPulse {
      0%, 100% {
        transform: scale(1);
        filter: brightness(1) saturate(1);
      }
      50% {
        transform: scale(1.02);
        filter: brightness(1.05) saturate(1.1);
      }
    }
    
    @keyframes textShimmer {
      0% {
        background-position: -200% center;
        opacity: 0.8;
      }
      50% {
        background-position: 0% center;
        opacity: 1;
      }
      100% {
        background-position: 200% center;
        opacity: 0.8;
      }
    }
    
    .kenya-gradient-text {
      animation: kenyaShine 4s ease-in-out 5;
      font-feature-settings: "kern" 1, "liga" 1;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .green-glow-text {
      animation: greenGlow 2s ease-in-out infinite;
      font-feature-settings: "kern" 1, "liga" 1;
      text-rendering: optimizeLegibility;
    }
    
    .premium-logo-text {
      animation: textShimmer 3s ease-in-out infinite;
      font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      letter-spacing: -0.02em;
    }
    
    .logo-premium-glow {
      animation: premiumPulse 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

