// Declaration file to handle missing type definitions

// Lucide React components
declare module 'lucide-react' {
  import React from 'react';
  
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export type Icon = React.FC<IconProps>;
  
  export const Search: Icon;
  export const Loader2: Icon;
  export const ArrowDown: Icon;
  export const ArrowUp: Icon;
  export const ArrowLeft: Icon;
  // Add other icons as needed
}

// React JSX Runtime
declare module 'react/jsx-runtime' {
  export default {} as unknown;
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
} 