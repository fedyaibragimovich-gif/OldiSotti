import React from 'react';
import {
  Car,
  Building2,
  Building,
  Smartphone,
  Briefcase,
  Armchair,
  Wrench,
  Shirt,
  Baby,
  Bike,
  PawPrint,
  Gift,
  Layers,
  Truck,
  Key,
  Home,
  Store,
  Laptop,
  Tv,
  Zap,
  Code,
  TrendingUp,
  Navigation,
  Hammer,
  Palette,
  Sprout,
  GraduationCap,
  Sparkles,
  Footprints,
  Watch,
  Gamepad2,
  Trophy,
  BookOpen,
  Music,
  Feather,
  Heart,
  Repeat,
  Grid
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-6 h-6", size = 24 }) => {
  switch (name) {
    // Main Categories
    case 'Car':
      return <Car size={size} className={className} />;
    case 'Building2':
      return <Building2 size={size} className={className} />;
    case 'Smartphone':
      return <Smartphone size={size} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    case 'Armchair':
      return <Armchair size={size} className={className} />;
    case 'Wrench':
      return <Wrench size={size} className={className} />;
    case 'Shirt':
      return <Shirt size={size} className={className} />;
    case 'Baby':
      return <Baby size={size} className={className} />;
    case 'Bike':
      return <Bike size={size} className={className} />;
    case 'PawPrint':
      return <PawPrint size={size} className={className} />;
    case 'Gift':
      return <Gift size={size} className={className} />;
    case 'Grid':
      return <Grid size={size} className={className} />;

    // Subcategories Icons
    case 'Truck':
      return <Truck size={size} className={className} />;
    case 'Building':
      return <Building size={size} className={className} />;
    case 'Key':
      return <Key size={size} className={className} />;
    case 'Home':
      return <Home size={size} className={className} />;
    case 'Store':
      return <Store size={size} className={className} />;
    case 'Laptop':
      return <Laptop size={size} className={className} />;
    case 'Tv':
      return <Tv size={size} className={className} />;
    case 'Zap':
      return <Zap size={size} className={className} />;
    case 'Code':
      return <Code size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Navigation':
      return <Navigation size={size} className={className} />;
    case 'Hammer':
      return <Hammer size={size} className={className} />;
    case 'Palette':
      return <Palette size={size} className={className} />;
    case 'Sprout':
      return <Sprout size={size} className={className} />;
    case 'GraduationCap':
      return <GraduationCap size={size} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'Footprints':
      return <Footprints size={size} className={className} />;
    case 'Watch':
      return <Watch size={size} className={className} />;
    case 'Gamepad2':
      return <Gamepad2 size={size} className={className} />;
    case 'Trophy':
      return <Trophy size={size} className={className} />;
    case 'BookOpen':
      return <BookOpen size={size} className={className} />;
    case 'Music':
      return <Music size={size} className={className} />;
    case 'Feather':
      return <Feather size={size} className={className} />;
    case 'Heart':
      return <Heart size={size} className={className} />;
    case 'Repeat':
      return <Repeat size={size} className={className} />;

    default:
      return <Layers size={size} className={className} />;
  }
};

