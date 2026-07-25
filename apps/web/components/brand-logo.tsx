type BrandLogoProps = {
  className?: string;
  product?: string;
};

export function BrandLogo({ className = "", product }: BrandLogoProps) {
  return (
    <span className={`brand-lockup ${className}`.trim()}>
      <span className="brand-logo-mark" aria-hidden="true">
        <img
          className="brand-logo-image"
          src="/images/nia-care-mark.png"
          alt=""
        />
      </span>
      <span className="brand-wording">
        <span className="brand-name">Nia</span>
        {product ? <span className="brand-product">{product}</span> : null}
      </span>
    </span>
  );
}
