import React from 'react';

// We'll rename 'text' to 'htmlContent' for clarity
interface ParagraphProps {
  htmlContent: string;
}

const Paragraph: React.FC<ParagraphProps> = ({ htmlContent }) => {
  return (
    // We replace `{text}` with the div below
    <div
      className="mt-4 text-gray-600 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default Paragraph;