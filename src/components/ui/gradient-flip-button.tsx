
'use client';

import React from 'react';
import { FlipButton, FlipButtonProps, FlipDirection } from './flip-button';
import { cn } from '@/lib/utils';

interface GradientFlipButtonProps extends Omit<FlipButtonProps, 'frontClassName' | 'backClassName'> {
  from?: FlipDirection;
  frontVariant?: 'default' | 'variant';
  backVariant?: 'default' | 'variant';
  customFrontClassName?: string;
  customBackClassName?: string;
}

const GradientFlipButton = React.forwardRef<HTMLButtonElement, GradientFlipButtonProps>(
  (
    {
      frontText,
      backText,
      from = 'top',
      frontVariant = 'default',
      backVariant = 'variant',
      className,
      customFrontClassName,
      customBackClassName,
      ...props
    },
    ref,
  ) => {
    const frontClass = frontVariant === 'default' ? 'gradient-button' : 'gradient-button-variant';
    const backClass = backVariant === 'default' ? 'gradient-button' : 'gradient-button-variant';

    return (
      <FlipButton
        ref={ref}
        frontText={frontText}
        backText={backText}
        from={from}
        className={className}
        frontClassName={cn(frontClass, customFrontClassName)}
        backClassName={cn(backClass, customBackClassName)}
        {...props}
      />
    );
  },
);

GradientFlipButton.displayName = 'GradientFlipButton';

export { GradientFlipButton };
