import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkipLink } from '@/components/reusable/skip-link';

describe('SkipLink', () => {
  it('renders the accessible label', () => {
    render(<SkipLink />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('is a link pointing to #main-content', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('is visually hidden by default (translate-y-full)', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveClass('-translate-y-full');
  });
});
