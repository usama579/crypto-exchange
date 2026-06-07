import Image from 'next/image';

interface LogoProps {
  /** Pixel size of the logo mark (square). */
  size?: number;
  /** Tailwind classes controlling the brand text size/weight. */
  textClassName?: string;
  /** Hide the "Coindexy" wordmark and render the mark only. */
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = 40,
  textClassName = 'text-2xl',
  showText = true,
  className = '',
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Coindexy logo"
        width={size}
        height={size}
        priority
        className="mr-3 rounded-lg"
      />
      {showText && (
        <h1 className={`font-bold text-gray-900 ${textClassName}`}>
          Coindexy
        </h1>
      )}
    </div>
  );
}
