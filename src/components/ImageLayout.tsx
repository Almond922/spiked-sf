import React from 'react';

// This component needs more information:
interface ImageLayoutProps {
  // 1. The HTML content for the text part (we use htmlContent because it might contain lists <ul>).
  htmlContent: string;
  // 2. The source URL for the image.
  imgSrc: string;
  // 3. The alt text for the image, for accessibility.
  altText: string;
}

const ImageLayout: React.FC<ImageLayoutProps> = ({ htmlContent, imgSrc, altText }) => {
  return (
    // This is the grid container.
    // 'mt-6' adds space above the whole section.
    // 'grid-cols-1 md:grid-cols-2' makes it 1 column on mobile, 2 columns on desktop.
    // 'gap-8' adds space between the text and the image.
    // 'items-start' aligns the items to the top of the grid.
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      {/* Column 1: The Text */}
      {/* We use the same styling as our Paragraph component for consistency. */}
      <div
        className="text-gray-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Column 2: The Image */}
      <div>
        <img
          src={imgSrc}
          alt={altText}
          // These classes add the rounded corners, shadow, and border to polish the image.
          className="rounded-lg shadow-md border border-gray-200"
        />
      </div>

    </div>
  );
};

export default ImageLayout;