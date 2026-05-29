import React from 'react';
export interface Recipe {
    title: string;
    description: string;
    image: string;
    prepTime: string;
    category: string;
    difficulty: string;
}
export interface RecipeCardProps {
    recipe: Recipe;
    isVisible?: boolean;
}
interface RecipesSectionProps {
    sectionRef: React.RefObject<HTMLElement>;
    visibleSections: string[];
}
declare const RecipesSection: React.FC<RecipesSectionProps>;
export default RecipesSection;
