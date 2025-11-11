'use client';

export default function LogoWordmark({
  size = 'sm',
}: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-base';

  return (
    <div className={`font-semibold tracking-wide ${sizeClass} select-none`}>
      <span className="text-neutral-200">Para</span>
      <span className="text-cyan-300">sphere</span>
    </div>
  );
}
