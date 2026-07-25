"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  LockKeyhole,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./order.module.css";

type Product = {
  id: string;
  name: string;
  hindi: string;
  category: string;
  quantity: string;
  price: number;
  localPrice: number;
  image: string;
  proof: string;
  source: string;
};

const products: Product[] = [
  {
    id: "groundnut-oil",
    name: "Cold-pressed groundnut oil",
    hindi: "मूंगफली का तेल",
    category: "Oils",
    quantity: "1 L",
    price: 210,
    localPrice: 260,
    image: "/images/essentials/groundnut-oil.jpg",
    proof: "Cold-pressed in small batches. No blended oil, mineral oil or artificial colour.",
    source: "Saurashtra mill collective",
  },
  {
    id: "mustard-oil",
    name: "Kachi ghani mustard oil",
    hindi: "सरसों का तेल",
    category: "Oils",
    quantity: "1 L",
    price: 180,
    localPrice: 225,
    image: "/images/essentials/mustard-oil.jpg",
    proof: "Single-origin mustard seed, traditionally pressed and screened against the Nia blacklist.",
    source: "Bharatpur oil mill",
  },
  {
    id: "whole-wheat-atta",
    name: "Whole wheat atta",
    hindi: "साबुत गेहूं आटा",
    category: "Atta & flours",
    quantity: "5 kg",
    price: 280,
    localPrice: 340,
    image: "/images/essentials/atta.jpg",
    proof: "Whole wheat milled without bleaching agents, added starch or artificial improvers.",
    source: "Nagpur chakki network",
  },
  {
    id: "toor-dal",
    name: "Unpolished toor dal",
    hindi: "अरहर दाल",
    category: "Dals & pulses",
    quantity: "1 kg",
    price: 145,
    localPrice: 185,
    image: "/images/essentials/toor-dal.jpg",
    proof: "Unpolished, colour-free and checked for moisture, stones and adulterants.",
    source: "Vidarbha farmer collective",
  },
  {
    id: "basmati-rice",
    name: "Everyday basmati rice",
    hindi: "बासमती चावल",
    category: "Rice & grains",
    quantity: "1 kg",
    price: 150,
    localPrice: 190,
    image: "/images/essentials/basmati-rice.jpg",
    proof: "Single-variety long-grain rice with no artificial fragrance or surface polish.",
    source: "Karnal rice mill",
  },
  {
    id: "turmeric",
    name: "Lakadong turmeric",
    hindi: "हल्दी पाउडर",
    category: "Salt & spices",
    quantity: "100 g",
    price: 45,
    localPrice: 60,
    image: "/images/essentials/turmeric.jpg",
    proof: "Ground whole turmeric with no colour, starch, chalk or exhausted powder.",
    source: "Meghalaya producer group",
  },
];

const categories = [
  "All",
  "Oils",
  "Atta & flours",
  "Dals & pulses",
  "Rice & grains",
  "Salt & spices",
];

type AuthStep = "mobile" | "otp" | "success";

function rupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OrderPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [authProduct, setAuthProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<AuthStep>("mobile");
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  const visibleProducts = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;
      const matchesQuery =
        !cleanQuery ||
        `${product.name} ${product.hindi} ${product.category}`
          .toLowerCase()
          .includes(cleanQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  useEffect(() => {
    if (!authProduct && !detailProduct) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAuthProduct(null);
        setDetailProduct(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [authProduct, detailProduct]);

  function openAuth(product: Product) {
    setDetailProduct(null);
    setAuthProduct(product);
    setMobile("");
    setOtp("");
    setStep("mobile");
    setError("");
  }

  function closeAuth() {
    setAuthProduct(null);
    setStep("mobile");
    setError("");
  }

  function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setStep("otp");
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setError("");
    setCartCount((count) => count + 1);
    setStep("success");
  }

  return (
    <main className={styles.store}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="NiaSave home">
          <BrandLogo product="Essentials" />
        </Link>
        <div className={styles.location}>
          <MapPin aria-hidden="true" />
          <span>
            <small>Pick up from</small>
            Nia Sukh Store
          </span>
          <ChevronDown aria-hidden="true" />
        </div>
        <label className={styles.headerSearch}>
          <Search aria-hidden="true" />
          <span className="sr-only">Search Nia Essentials</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search oil, dal, atta…"
          />
        </label>
        <nav className={styles.desktopNav} aria-label="Store navigation">
          <span><ShieldCheck aria-hidden="true" /> Nia-Certified</span>
          <Link href="/">NiaBooks</Link>
          <button type="button" className={styles.cartButton} aria-label={`${cartCount} items in cart`}>
            <ShoppingBag aria-hidden="true" />
            Cart
            <b>{cartCount}</b>
          </button>
        </nav>
        <button
          className={styles.mobileMenuButton}
          type="button"
          aria-expanded={mobileMenu}
          aria-controls="store-mobile-menu"
          onClick={() => setMobileMenu((open) => !open)}
        >
          {mobileMenu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{mobileMenu ? "Close menu" : "Open menu"}</span>
        </button>
        {mobileMenu && (
          <nav id="store-mobile-menu" className={styles.mobileNav} aria-label="Store navigation">
            <span><ShieldCheck aria-hidden="true" /> Nia-Certified</span>
            <Link href="/" onClick={() => setMobileMenu(false)}>NiaBooks</Link>
            <button type="button" onClick={() => setMobileMenu(false)}>
              <ShoppingBag aria-hidden="true" /> Cart · {cartCount}
            </button>
          </nav>
        )}
      </header>

      <div className={styles.mobileSearchWrap}>
        <label className={styles.mobileSearch}>
          <Search aria-hidden="true" />
          <span className="sr-only">Search Nia Essentials</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search oil, dal, atta…"
          />
        </label>
      </div>

      <div className={styles.storeLayout}>
        <aside className={styles.intro}>
          <div>
            <h1>Nia Essentials</h1>
            <p>Everyday essentials. Certified, priced fairly, recorded in NiaBooks.</p>
          </div>
          <div className={styles.principles}>
            <article>
              <ShieldCheck aria-hidden="true" />
              <strong>Nia-Certified</strong>
              <span>200-ingredient blacklist vetted</span>
            </article>
            <article>
              <SlidersHorizontal aria-hidden="true" />
              <strong>Priced fairly</strong>
              <span>Compared with the local market</span>
            </article>
            <article>
              <BookOpen aria-hidden="true" />
              <strong>In NiaBooks</strong>
              <span>Every purchase is recorded</span>
            </article>
          </div>
          <button
            className={styles.promotion}
            type="button"
            onClick={() => {
              setCategory("Oils");
              document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>New · cold-pressed</span>
            <strong>Oils with nothing hidden.</strong>
            <small>Vetted against the 200-ingredient blacklist.</small>
            <b>Order now <ArrowRight aria-hidden="true" /></b>
          </button>
          <div className={styles.savingsNote}>
            <strong>You saved ₹51 this week</strong>
            <span>vs the local market · बाज़ार से कम</span>
            <ArrowRight aria-hidden="true" />
          </div>
          <p className={styles.previewNote}>
            Commerce preview. Orders are available to registered NiaBooks members.
          </p>
        </aside>

        <section id="catalog" className={styles.catalog}>
          <div className={styles.catalogTitle}>
            <div>
              <h2>Nia-Certified essentials</h2>
              <span>{visibleProducts.length} items shown</span>
            </div>
            <button type="button">
              Sort by <strong>Featured</strong> <ChevronDown aria-hidden="true" />
            </button>
          </div>
          <div className={styles.categories} role="group" aria-label="Product categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? styles.activeCategory : ""}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <p className={styles.catalogPromise}>
            Every item Nia-Certified · बिचौलिया नहीं
          </p>

          {visibleProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {visibleProducts.map((product) => (
                <article className={styles.productCard} key={product.id}>
                  <button
                    className={styles.productImage}
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    aria-label={`View ${product.name}`}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} with its source ingredient`}
                      fill
                      sizes="(max-width: 720px) 50vw, (max-width: 1180px) 33vw, 23vw"
                    />
                    <span><ShieldCheck aria-hidden="true" /> Nia-Certified</span>
                  </button>
                  <div className={styles.productInfo}>
                    <button
                      type="button"
                      className={styles.productName}
                      onClick={() => setDetailProduct(product)}
                    >
                      <strong>{product.name}</strong>
                      <span>{product.hindi} · {product.quantity}</span>
                    </button>
                    <div className={styles.pricing}>
                      <div>
                        <small>Your price</small>
                        <strong>{rupees(product.price)}</strong>
                      </div>
                      <div>
                        <small>Local price</small>
                        <del>{rupees(product.localPrice)}</del>
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <span>Save <strong>{rupees(product.localPrice - product.price)}</strong></span>
                      <button type="button" onClick={() => openAuth(product)}>Add</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Search aria-hidden="true" />
              <h3>No essentials found</h3>
              <p>Try another product or category.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>
                Clear search
              </button>
            </div>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        <BrandLogo product="Essentials" />
        <p>Certified essentials that cost less, reveal their source and write back to the Member&apos;s NiaBooks record.</p>
        <div>
          <Link href="/">NiaBooks</Link>
          <Link href="https://www.nia.one/">Nia home ↗</Link>
        </div>
      </footer>

      {detailProduct && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDetailProduct(null);
        }}>
          <section className={styles.detailDrawer} role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <button className={styles.closeButton} type="button" onClick={() => setDetailProduct(null)} aria-label="Close product details">
              <X aria-hidden="true" />
            </button>
            <div className={styles.detailImage}>
              <Image src={detailProduct.image} alt="" fill sizes="(max-width: 720px) 100vw, 42vw" />
              <span><ShieldCheck aria-hidden="true" /> Nia-Certified</span>
            </div>
            <div className={styles.detailCopy}>
              <button className={styles.backButton} type="button" onClick={() => setDetailProduct(null)}>
                <ArrowLeft aria-hidden="true" /> Back to essentials
              </button>
              <h2 id="detail-title">{detailProduct.name}</h2>
              <p className={styles.hindi}>{detailProduct.hindi} · {detailProduct.quantity}</p>
              <div className={styles.detailPrice}>
                <strong>{rupees(detailProduct.price)}</strong>
                <del>{rupees(detailProduct.localPrice)} at local market</del>
                <span>Save {rupees(detailProduct.localPrice - detailProduct.price)}</span>
              </div>
              <article className={styles.proof}>
                <ShieldCheck aria-hidden="true" />
                <div>
                  <strong>Verified for Nia Standard</strong>
                  <p>{detailProduct.proof}</p>
                </div>
              </article>
              <dl className={styles.source}>
                <div><dt>Source</dt><dd>{detailProduct.source}</dd></div>
                <div><dt>Record</dt><dd>Purchase writes to NiaBooks</dd></div>
                <div><dt>Pick up</dt><dd>After 5 PM · Sukh Store</dd></div>
              </dl>
              <button className={styles.detailAdd} type="button" onClick={() => openAuth(detailProduct)}>
                Add to order <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      )}

      {authProduct && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeAuth();
        }}>
          <section className={styles.authModal} role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className={styles.closeButton} type="button" onClick={closeAuth} aria-label="Close sign in">
              <X aria-hidden="true" />
            </button>

            {step === "mobile" && (
              <>
                <div className={styles.authIcon}><BookOpen aria-hidden="true" /></div>
                <h2 id="auth-title">Continue with NiaBooks</h2>
                <p>Enter the mobile number registered in NiaBooks to receive an OTP.</p>
                <div className={styles.selectedProduct}>
                  <Image src={authProduct.image} alt="" width={56} height={56} />
                  <span><strong>{authProduct.name}</strong>{authProduct.quantity} · {rupees(authProduct.price)}</span>
                </div>
                <form onSubmit={requestOtp} noValidate>
                  <label htmlFor="mobile">Mobile number</label>
                  <div className={styles.mobileField}>
                    <span>+91</span>
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={mobile}
                      onChange={(event) => {
                        setMobile(event.target.value.replace(/\D/g, "").slice(0, 10));
                        setError("");
                      }}
                      placeholder="10-digit mobile number"
                      autoFocus
                    />
                  </div>
                  {error && <p className={styles.formError} role="alert">{error}</p>}
                  <button className={styles.submitButton} type="submit">Send OTP</button>
                </form>
                <small className={styles.privacy}><LockKeyhole aria-hidden="true" /> Your number is used only to find your NiaBooks membership.</small>
              </>
            )}

            {step === "otp" && (
              <>
                <div className={styles.authIcon}><LockKeyhole aria-hidden="true" /></div>
                <h2 id="auth-title">Enter your OTP</h2>
                <p>Use the 6-digit code sent to +91 {mobile.slice(0, 2)}••• ••{mobile.slice(-3)}.</p>
                <form onSubmit={verifyOtp} noValidate>
                  <label htmlFor="otp">One-time password</label>
                  <input
                    id="otp"
                    className={styles.otpField}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) => {
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="000000"
                    autoFocus
                  />
                  {error && <p className={styles.formError} role="alert">{error}</p>}
                  <button className={styles.submitButton} type="submit">Verify & add</button>
                </form>
                <button className={styles.textButton} type="button" onClick={() => { setStep("mobile"); setOtp(""); }}>
                  Change mobile number
                </button>
                <small className={styles.demoDisclosure}>Showcase mode — enter any 6 digits. No SMS or order is sent.</small>
              </>
            )}

            {step === "success" && (
              <div className={styles.successState}>
                <span><Check aria-hidden="true" /></span>
                <h2 id="auth-title">Added to your order</h2>
                <p>{authProduct.name} is now in the showcase cart.</p>
                <button className={styles.submitButton} type="button" onClick={closeAuth}>Continue shopping</button>
                <small>In production, this purchase would remain linked to the Member&apos;s NiaBooks record.</small>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
