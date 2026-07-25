type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <span className={`brand-lockup ${className}`.trim()}>
      <img
        className="brand-logo-image"
        src="/images/nia-care-mark.png"
        alt=""
        aria-hidden="true"
      />
      <span className="brand-name">nia</span>
    </span>
  );
}
