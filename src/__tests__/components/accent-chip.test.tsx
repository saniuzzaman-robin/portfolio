import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AccentChip } from '@/components/ui/accent-chip';

describe('AccentChip', () => {
  it('renders its children', () => {
    render(<AccentChip accent="primary">TypeScript</AccentChip>);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('always includes the terminal-text class', () => {
    render(<AccentChip accent="secondary">React</AccentChip>);
    expect(screen.getByText('React')).toHaveClass('terminal-text');
  });

  it('applies an additional className when provided', () => {
    render(
      <AccentChip accent="tertiary" className="my-custom-class">
        Node.js
      </AccentChip>
    );
    expect(screen.getByText('Node.js')).toHaveClass('my-custom-class');
  });

  it('sets the color inline style to the primary CSS variable', () => {
    render(<AccentChip accent="primary">Primary</AccentChip>);
    expect(screen.getByText('Primary')).toHaveStyle({
      color: 'var(--color-primary-50)',
    });
  });

  it('sets the color inline style to the secondary CSS variable', () => {
    render(<AccentChip accent="secondary">Secondary</AccentChip>);
    expect(screen.getByText('Secondary')).toHaveStyle({
      color: 'var(--color-secondary-50)',
    });
  });

  it('renders as a <span>', () => {
    const { container } = render(<AccentChip accent="primary">Tag</AccentChip>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });
});
