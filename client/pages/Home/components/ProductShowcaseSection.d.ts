import React from 'react';
interface ProductShowcaseSectionProps {
    sectionRef: React.RefObject<HTMLElement | null>;
    visibleSections: string[];
    loading: boolean;
    addToCart: (item: {
        id: string;
        name: string;
        description: string;
        price: number;
        image: string;
        quantity: number;
    }) => void;
}
declare const ProductShowcaseSection: React.FC<ProductShowcaseSectionProps>;
export default ProductShowcaseSection;
