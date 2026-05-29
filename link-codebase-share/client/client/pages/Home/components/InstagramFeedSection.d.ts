import React from 'react';
interface InstagramFeedSectionProps {
    sectionRef: React.RefObject<HTMLElement | null>;
    visibleSections: string[];
}
declare const InstagramFeedSection: React.FC<InstagramFeedSectionProps>;
export default InstagramFeedSection;
