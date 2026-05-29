# Material Icons Usage Guide

This guide shows you how to use Google's Material Design Icons in your React application.

## Quick Start

### 1. Basic Usage

```jsx
import MaterialIcon from './src/components/MaterialIcon';

// Basic icon
<MaterialIcon icon="home" />

// With custom size
<MaterialIcon icon="search" size={32} />

// With custom color
<MaterialIcon icon="favorite" className="text-red-500" />

// With click handler
<MaterialIcon 
  icon="share" 
  onClick={() => console.log('Shared!')}
  className="cursor-pointer hover:text-blue-600" 
/>
```

### 2. Different Variants

```jsx
// Material Icons (Classic)
<MaterialIcon icon="home" variant="filled" />
<MaterialIcon icon="home" variant="outlined" />
<MaterialIcon icon="home" variant="rounded" />
<MaterialIcon icon="home" variant="sharp" />
<MaterialIcon icon="home" variant="twoTone" />

// Material Symbols (Newer)
<MaterialIcon icon="home" variant="symbols" />
<MaterialIcon icon="home" variant="symbolsRounded" />
<MaterialIcon icon="home" variant="symbolsSharp" />
```

### 3. Using Icon Mapping

```jsx
import MaterialIcon from './src/components/MaterialIcon';
import { getIcon } from './src/utils/materialIcons';

// Using the mapping
<MaterialIcon icon={getIcon('home')} />
<MaterialIcon icon={getIcon('search')} />
<MaterialIcon icon={getIcon('favorite')} />

// Check if icon exists
import { hasIcon } from './src/utils/materialIcons';
if (hasIcon('customIcon')) {
  // Use the icon
}
```

## Common Real Estate Icons

### Navigation
- `home` - Home icon
- `search` - Search icon
- `location` - Location pin
- `map` - Map icon
- `directions` - Directions icon

### Property Types
- `apartment` - Apartment building
- `house` - House icon
- `villa` - Villa icon
- `building` - Office building
- `land` - Landscape/land

### Property Features
- `bed` - Bed icon
- `bathroom` - Bathroom icon
- `kitchen` - Kitchen icon
- `parking` - Parking icon
- `wifi` - WiFi icon
- `pool` - Pool icon
- `gym` - Gym icon
- `elevator` - Elevator icon

### Actions
- `favorite` - Filled heart
- `favoriteBorder` - Outlined heart
- `share` - Share icon
- `call` - Phone icon
- `email` - Email icon
- `message` - Message icon
- `view` - Eye icon
- `edit` - Edit icon
- `delete` - Delete icon

### UI Elements
- `menu` - Hamburger menu
- `close` - Close/X icon
- `back` - Back arrow
- `next` - Forward arrow
- `filter` - Filter icon
- `sort` - Sort icon
- `settings` - Settings icon
- `notifications` - Bell icon
- `profile` - Person icon

## Replacing Lucide React Icons

### Before (Lucide React)
```jsx
import { Home, Search, Heart } from 'lucide-react';

<Home className="w-6 h-6" />
<Search className="w-6 h-6" />
<Heart className="w-6 h-6" />
```

### After (Material Icons)
```jsx
import MaterialIcon from './src/components/MaterialIcon';

<MaterialIcon icon="home" size={24} />
<MaterialIcon icon="search" size={24} />
<MaterialIcon icon="favorite" size={24} />
```

## Example Component

```jsx
import React from 'react';
import MaterialIcon from './MaterialIcon';
import { getIcon } from '../utils/materialIcons';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{property.title}</h3>
        <MaterialIcon 
          icon={getIcon('favorite')} 
          className="text-red-500 cursor-pointer hover:text-red-700" 
          onClick={() => handleFavorite(property.id)}
        />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <MaterialIcon icon={getIcon('location')} size={16} className="text-gray-500" />
        <span className="text-sm text-gray-600">{property.address}</span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MaterialIcon icon={getIcon('bed')} size={16} />
          <span>{property.bedrooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <MaterialIcon icon={getIcon('bathroom')} size={16} />
          <span>{property.bathrooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <MaterialIcon icon={getIcon('squareFoot')} size={16} />
          <span>{property.area} sqft</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-bold text-green-600">
          ${property.price.toLocaleString()}
        </span>
        <MaterialIcon 
          icon={getIcon('share')} 
          className="text-blue-500 cursor-pointer hover:text-blue-700" 
          onClick={() => handleShare(property)}
        />
      </div>
    </div>
  );
};

export default PropertyCard;
```

## Available Icon Names

You can browse all available Material Icons at:
- [Material Icons Gallery](https://fonts.google.com/icons?icon.set=Material+Icons)
- [Material Symbols Gallery](https://fonts.google.com/icons?icon.set=Material+Symbols)

## Tips

1. **Performance**: Material Icons are loaded via Google Fonts, so they're cached globally
2. **Accessibility**: Always provide meaningful alt text or aria-labels for interactive icons
3. **Consistency**: Use the same variant throughout your application for consistency
4. **Sizing**: Use consistent sizes (16, 24, 32, 48) for better visual hierarchy
5. **Colors**: Use Tailwind CSS classes for consistent theming

## Migration Strategy

1. Start by replacing icons in new components
2. Gradually replace icons in existing components
3. Use the icon mapping for consistency
4. Test thoroughly to ensure all icons display correctly

## Troubleshooting

- If an icon doesn't appear, check the icon name spelling
- Ensure the Google Fonts are loaded properly
- Check browser console for any font loading errors
- Verify the CSS classes are applied correctly




