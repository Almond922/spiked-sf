import React from 'react';

interface HeadingProps {
  text: string;
}

const Heading: React.FC<HeadingProps> = ({ text }) => {
  return (
    <h2 className="text-2xl font-semibold text-gray-800 pt-8 mt-12 border-t border-gray-200">
      {text}
    </h2>
  );
};

export default Heading;