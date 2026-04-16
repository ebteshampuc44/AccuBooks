import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
      © {currentYear} AccuBooks. All rights reserved.
    </footer>
  );
};

export default Footer;