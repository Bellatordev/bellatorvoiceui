
import React from 'react';

const PageFooter: React.FC = () => {
  return (
    <footer className="mt-8 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Voice Assistant</p>
    </footer>
  );
};

export default PageFooter;
