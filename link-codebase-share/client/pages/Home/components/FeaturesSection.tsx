import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, Users, ArrowRight, ShieldCheck, Activity, Droplets } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface FeaturesSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ sectionRef }) => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: ShieldCheck,
      title: "Gut Health",
      description: "Our specially selected probiotic cultures promote digestive health and strengthen your immune system naturally.",
      color: "emerald",
      link: "/benefits"
    },
    {
      icon: Leaf,
      title: "Natural Ingredients",
      description: "Made with fresh milk from local Kenyan farms and natural flavors, without artificial preservatives or additives.",
      color: "green",
      link: "/ingredients"
    },
    {
      icon: Activity,
      title: "Enhanced Immunity",
      description: "Boost your body's natural defenses with our scientifically formulated probiotic strains for optimal health.",
      color: "teal",
      link: "/immunity"
    },
    {
      icon: Heart,
      title: "Heart Health",
      description: "Support cardiovascular wellness with our yogurt's natural nutrients and beneficial bacteria.",
      color: "emerald",
      link: "/heart-health"
    },
    {
      icon: Droplets,
      title: "Hydration & Energy",
      description: "Stay energized and hydrated with our nutrient-rich yogurt that provides sustained energy throughout the day.",
      color: "green",
      link: "/energy"
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Supporting local farmers and sustainable practices while investing in healthier Kenyan communities.",
      color: "teal",
      link: "/community"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10',
        text: isDark ? 'text-emerald-400' : 'text-emerald-600',
        border: isDark ? 'border-emerald-500/30' : 'border-emerald-500/20',
        hover: isDark ? 'hover:text-emerald-300' : 'hover:text-emerald-700'
      },
      green: {
        bg: isDark ? 'bg-green-500/20' : 'bg-green-500/10',
        text: isDark ? 'text-green-400' : 'text-green-600',
        border: isDark ? 'border-green-500/30' : 'border-green-500/20',
        hover: isDark ? 'hover:text-green-300' : 'hover:text-green-700'
      },
      teal: {
        bg: isDark ? 'bg-teal-500/20' : 'bg-teal-500/10',
        text: isDark ? 'text-teal-400' : 'text-teal-600',
        border: isDark ? 'border-teal-500/30' : 'border-teal-500/20',
        hover: isDark ? 'hover:text-teal-300' : 'hover:text-teal-700'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.emerald;
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12 xl:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-6 lg:mb-8"
          >
            <span className={`inline-block px-6 py-3 rounded-full font-semibold tracking-wide transition-all duration-700 ease-out ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
            }`}>
              Why Choose Bogani
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-4xl lg:text-5xl font-bold mb-6 lg:mb-8 leading-tight tracking-tight transition-colors duration-700 ease-out ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            A Healthier You Starts from Within
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`max-w-2xl mx-auto text-lg leading-relaxed transition-colors duration-700 ease-out ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Our premium probiotic yogurt delivers delicious taste and essential health benefits in every spoonful.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const IconComponent = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                className={`rounded-3xl p-8 lg:p-12 shadow-xl backdrop-blur-xl border transition-all duration-700 ease-out h-full ${
                  isDark
                    ? 'bg-gray-800/50 border-gray-600/50 hover:bg-gray-800/70 hover:border-emerald-500/30'
                    : 'bg-white/70 border-gray-200/50 hover:bg-white/90 hover:border-emerald-500/30'
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Top Border */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${
                  feature.color === 'emerald' ? 'from-emerald-500 to-green-500' :
                  feature.color === 'green' ? 'from-green-500 to-teal-500' :
                  'from-teal-500 to-emerald-500'
                }`}></div>

                {/* Icon */}
                <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 lg:mb-8 transition-all duration-700 ease-out ${colors.bg}`}>
                  <IconComponent className={`w-8 h-8 lg:w-10 lg:h-10 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className={`text-xl lg:text-2xl font-bold mb-4 lg:mb-6 leading-tight tracking-tight transition-colors duration-700 ease-out ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                
                <p className={`text-base leading-relaxed mb-6 lg:mb-8 transition-colors duration-700 ease-out ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                {/* Link */}
                <a 
                  href={feature.link} 
                  className={`inline-flex items-center font-semibold tracking-wide transition-all duration-700 ease-out ${colors.text} ${colors.hover}`}
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-700 ease-out" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
