import React from 'react';

// This component will accept an array of links
interface TocProps {
  links: { id: string; text: string }[];
}

const TableOfContents: React.FC<TocProps> = ({ links }) => {
  return (
    // We use Tailwind classes to style the box
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-12">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">IN THIS ARTICLE</h3>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link.id}>
            {/* This creates a link that smoothly scrolls to the section */}
            <a href={`#${link.id}`} className="text-blue-600 hover:underline">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;