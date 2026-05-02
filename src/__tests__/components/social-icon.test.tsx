import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SocialIcon, type SocialIconType } from '@/components/reusable/social-icon';

const icons: SocialIconType[] = ['github', 'linkedin', 'email', 'twitter', 'facebook'];

describe('SocialIcon', () => {
  it.each(icons)('renders an SVG for icon type "%s"', (icon) => {
    const { container } = render(<SocialIcon icon={icon} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('forwards the className to the SVG element', () => {
    const { container } = render(<SocialIcon icon="github" className="w-8 h-8" />);
    expect(container.querySelector('svg')).toHaveClass('w-8 h-8');
  });

  it('defaults className to "w-5 h-5"', () => {
    const { container } = render(<SocialIcon icon="linkedin" />);
    expect(container.querySelector('svg')).toHaveClass('w-5 h-5');
  });

  it('renders a filled SVG for github by default', () => {
    const { container } = render(<SocialIcon icon="github" />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });

  it('renders an unfilled SVG when fill=false', () => {
    const { container } = render(<SocialIcon icon="github" fill={false} />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none');
  });

  it('email icon always renders a stroke-based SVG', () => {
    const { container } = render(<SocialIcon icon="email" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });
});
