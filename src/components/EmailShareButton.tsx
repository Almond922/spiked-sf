import React from 'react';
import { Mail } from 'lucide-react';

interface EmailShareButtonProps {
    isDarkMode: boolean;
    onClick: () => void;
    disabled: boolean;
}

const EmailShareButton: React.FC<EmailShareButtonProps> = ({ isDarkMode, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
            }`}
            title="Share via Gmail"
        >
            <Mail className="w-4 h-4" />
            <span>Share</span>
        </button>
    );
};

export default EmailShareButton;