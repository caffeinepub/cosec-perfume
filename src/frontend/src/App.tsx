import { CheckoutModal } from "@/components/CheckoutModal";
import { DeliveryPortal } from "@/components/DeliveryPortal";
import { PaymentFailure } from "@/components/PaymentFailure";
import { PaymentSuccess } from "@/components/PaymentSuccess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowRight,
  CheckCircle2,
  Flower2,
  Heart,
  Instagram,
  Leaf,
  Loader2,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  User,
  Wind,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { SiTiktok } from "react-icons/si";
import { toast } from "sonner";
import type { ShoppingItem } from "./backend";
import { useActor } from "./hooks/useActor";
import { useCreateCheckoutSession } from "./hooks/useCreateCheckoutSession";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  type Collection,
  type Product,
  useGetAllCollections,
  useGetAllProducts,
  useSubscribeEmail,
} from "./hooks/useQueries";

// ── Sample / fallback data ────────────────────────────────────────────────────
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1n,
    name: "Daily Dew",
    collection: "daily-fresh",
    scentNotes: "Citrus + Green Tea",
    sizeMl: 50n,
    price: 299n,
    description:
      "A light, refreshing everyday scent that keeps you fresh from morning to night. Alcohol-free, skin-safe formula.",
  },
  {
    id: 2n,
    name: "Aqua Bloom",
    collection: "daily-fresh",
    scentNotes: "Ocean Mist + Jasmine",
    sizeMl: 50n,
    price: 329n,
    description:
      "Cool ocean-inspired freshness with a soft floral heart. Perfect for school and outings.",
  },
  {
    id: 3n,
    name: "Candy Cloud",
    collection: "daily-fresh",
    scentNotes: "Peach + Coconut + Musk",
    sizeMl: 50n,
    price: 319n,
    description:
      "Sweet, dreamy, and playful — a fruity musk blend that lasts all afternoon.",
  },
  {
    id: 4n,
    name: "Sport Rush",
    collection: "sport-active",
    scentNotes: "Eucalyptus + Cedar",
    sizeMl: 75n,
    price: 399n,
    description:
      "Energising and long-lasting, designed to keep up with your most active day. Controls sweat odor effectively.",
  },
  {
    id: 5n,
    name: "Fresh Kick",
    collection: "sport-active",
    scentNotes: "Mint + Lime + Vetiver",
    sizeMl: 75n,
    price: 379n,
    description:
      "Crisp and invigorating post-workout freshness. Stays strong through gym sessions and sports practice.",
  },
  {
    id: 6n,
    name: "Petal Calm",
    collection: "sensitive-soothe",
    scentNotes: "Rose + Chamomile",
    sizeMl: 50n,
    price: 279n,
    description:
      "Ultra-gentle floral blend, dermatologist-tested for the most sensitive skin types.",
  },
  {
    id: 7n,
    name: "Vanilla Haze",
    collection: "sensitive-soothe",
    scentNotes: "Vanilla + Sandalwood + Aloe",
    sizeMl: 50n,
    price: 349n,
    description:
      "Warm, creamy vanilla with soothing sandalwood. Hypoallergenic and alcohol-free.",
  },
  {
    id: 8n,
    name: "Midnight Bloom",
    collection: "night-edition",
    scentNotes: "Oud + Musk + Amber",
    sizeMl: 50n,
    price: 449n,
    description:
      "A rich, mysterious evening scent with premium oud and amber. For those special nights out.",
  },
];

// Product images mapped by id
const PRODUCT_IMAGES: Record<string, string> = {
  "1": "/assets/generated/perfume-fresh-green.dim_600x700.jpg",
  "2": "/assets/generated/perfume-ocean-mist.dim_600x700.jpg",
  "3": "/assets/generated/perfume-sakura-bloom.dim_600x700.jpg",
  "4": "/assets/generated/perfume-jasmine-white.dim_600x700.jpg",
  "5": "/assets/generated/perfume-lavender-dream.dim_600x700.jpg",
  "6": "/assets/generated/perfume-rose-blush.dim_600x700.jpg",
  "7": "/assets/generated/perfume-vanilla-warmth.dim_600x700.jpg",
  "8": "/assets/generated/perfume-rose-oud.dim_600x700.jpg",
};

const SAMPLE_COLLECTIONS: Collection[] = [
  {
    name: "Daily Fresh",
    description: "Light, everyday scents for all-day freshness.",
  },
  {
    name: "Sport Active",
    description: "Sweat-fighting active formulas for your busiest days.",
  },
  {
    name: "Sensitive Soothe",
    description: "Gentle, skin-safe fragrances for sensitive skin types.",
  },
  {
    name: "Night Edition",
    description: "Rich, bold evening scents for special occasions.",
  },
];

// Collection slug mapping
const COLLECTION_SLUGS: Record<string, string> = {
  "Daily Fresh": "daily-fresh",
  "Sport Active": "sport-active",
  "Sensitive Soothe": "sensitive-soothe",
  "Night Edition": "night-edition",
};

// Pastel tile colours per product index — purple/lavender/mauve
const TILE_STYLES = [
  { bg: "#EDD9F7", icon: Wind },
  { bg: "#F5D9EF", icon: Leaf },
  { bg: "#DDD9F7", icon: Sparkles },
  { bg: "#F7D9E8", icon: Flower2 },
];

// Collection card colours — purple shades
const COLLECTION_STYLES = [
  { bg: "#EDD9F7", accent: "#7C3AED" },
  { bg: "#F5D9EF", accent: "#9B3DBF" },
  { bg: "#DDD9F7", accent: "#5B3AED" },
  { bg: "#F7D9E8", accent: "#C026D3" },
];

// Shared neon glow button style
const NEON_BTN: React.CSSProperties = {
  background: "linear-gradient(135deg, #9B3DBF, #7C3AED)",
  boxShadow:
    "0 0 15px rgba(232,121,249,0.8), 0 0 30px rgba(192,38,211,0.6), 0 0 60px rgba(192,38,211,0.3)",
  border: "2px solid rgba(232,121,249,0.9)",
};

// Derive TOP / MIDDLE / BASE fragrance notes from scentNotes string
function deriveFragranceNotes(scentNotes: string): {
  top: string;
  middle: string;
  base: string;
} {
  const parts = scentNotes.split("+").map((s) => s.trim());
  return {
    top: parts[0] ?? scentNotes,
    middle: parts[1] ?? "Floral Heart",
    base: "Musk & Sandalwood",
  };
}

// Smooth scroll helper
function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ── Cart ─────────────────────────────────────────────────────────────────────
type CartItem = { product: Product; qty: number };

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const add = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  }, []);
  const total = items.reduce((sum, i) => sum + i.qty, 0);
  const clear = useCallback(() => setItems([]), []);
  return { items, add, clear, total };
}

// ── Product Detail Modal ──────────────────────────────────────────────────────
function ProductModal({
  product,
  open,
  onClose,
  onAddToCart,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  const [selectedSize, setSelectedSize] = useState<number>(50);

  if (!product) return null;

  const notes = deriveFragranceNotes(product.scentNotes);
  const sizes = [50, 75];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md rounded-3xl p-0 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(180,130,220,0.3)",
        }}
        data-ocid="product.modal"
      >
        {/* Product image */}
        <div
          className="w-full overflow-hidden"
          style={{
            height: "220px",
            background: "linear-gradient(135deg, #EDD9F7 0%, #F5D9EF 100%)",
          }}
        >
          {product && PRODUCT_IMAGES[product.id.toString()] ? (
            <img
              src={PRODUCT_IMAGES[product.id.toString()]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles
                className="w-16 h-16 opacity-40"
                style={{ color: "#9B3DBF" }}
              />
            </div>
          )}
        </div>

        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle
              className="font-extrabold text-2xl"
              style={{ color: "#1a1a2e" }}
            >
              {product.name}
            </DialogTitle>
            <p className="text-sm mt-1" style={{ color: "#7B5A9A" }}>
              {product.scentNotes} · {Number(product.sizeMl)}ml
            </p>
          </DialogHeader>

          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "#5B3A7A" }}
          >
            {product.description}
          </p>

          {/* Fragrance notes */}
          <div className="mb-5">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#9B3DBF" }}
            >
              Fragrance Notes
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["TOP", "MIDDLE", "BASE"] as const).map((layer) => (
                <div
                  key={layer}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(237,217,247,0.6)" }}
                >
                  <p
                    className="text-xs font-bold mb-1"
                    style={{ color: "#9B3DBF" }}
                  >
                    {layer}
                  </p>
                  <p className="text-xs" style={{ color: "#3D1A5A" }}>
                    {layer === "TOP"
                      ? notes.top
                      : layer === "MIDDLE"
                        ? notes.middle
                        : notes.base}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Size selection */}
          <div className="mb-6">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#9B3DBF" }}
            >
              Size
            </p>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    ...(selectedSize === size
                      ? NEON_BTN
                      : {
                          background: "rgba(237,217,247,0.6)",
                          border: "1px solid rgba(155,61,191,0.3)",
                        }),
                    color: selectedSize === size ? "#fff" : "#7C3AED",
                  }}
                  data-ocid="product.toggle"
                >
                  {size}ml
                </button>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <span
              className="font-extrabold text-2xl"
              style={{ color: "#7C3AED" }}
            >
              ₹{Number(product.price)}
            </span>
            <Button
              className="rounded-full px-6 font-bold text-white"
              style={NEON_BTN}
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              data-ocid="product.primary_button"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Flowing Silk Wave SVGs ────────────────────────────────────────────────────
function SilkWaves() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Wave 1 — top-left sweeping diagonally right, slow pulse */}
      <svg
        className="absolute -top-24 -left-32"
        width="820"
        height="620"
        viewBox="0 0 820 620"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          animation: "wavePulse1 5s ease-in-out infinite alternate",
        }}
      >
        <path
          d="M-100,200 C50,80 200,320 380,160 C520,-10 640,220 820,100 C900,40 920,160 1000,110
             L1000,520 C800,460 600,570 400,460 C200,360 40,510 -100,400 Z"
          fill="rgba(180,130,220,0.35)"
        />
      </svg>

      {/* Wave 2 — top-right curving down, offset pulse */}
      <svg
        className="absolute -top-10 -right-40"
        width="740"
        height="540"
        viewBox="0 0 740 540"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          animation: "wavePulse2 6s ease-in-out infinite alternate",
        }}
      >
        <path
          d="M740,0 C620,60 520,200 680,260 C820,310 640,420 740,500
             L740,540 L500,540 C540,440 480,320 560,220 C620,140 580,60 500,0 Z"
          fill="rgba(210,150,220,0.3)"
        />
      </svg>

      {/* Wave 3 — center-right mid-page ribbon */}
      <svg
        className="absolute top-1/3 -right-28"
        width="660"
        height="500"
        viewBox="0 0 660 500"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          animation: "wavePulse1 7s ease-in-out infinite alternate-reverse",
        }}
      >
        <path
          d="M660,0 C540,80 400,40 460,180 C520,310 360,340 440,460
             C500,540 600,480 660,500 L660,500 L460,500 C380,380 500,280 400,160
             C320,60 460,20 380,0 Z"
          fill="rgba(220,160,230,0.28)"
        />
      </svg>

      {/* Wave 4 — bottom-left sweeping up, slow drift */}
      <svg
        className="absolute -bottom-10 -left-24"
        width="800"
        height="500"
        viewBox="0 0 800 500"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          animation: "wavePulse2 8s ease-in-out infinite alternate",
        }}
      >
        <path
          d="M-100,500 C60,380 160,420 320,300 C480,180 540,320 680,200
             C780,120 820,240 900,180 L900,500 Z"
          fill="rgba(190,140,215,0.32)"
        />
      </svg>

      {/* Wave 5 — center-left mid sweep */}
      <svg
        className="absolute top-1/2 -left-20"
        width="580"
        height="420"
        viewBox="0 0 580 420"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          animation: "wavePulse1 9s ease-in-out infinite alternate-reverse",
        }}
      >
        <path
          d="M-80,200 C40,100 160,280 300,160 C420,60 500,200 580,120
             L580,420 C480,380 340,460 220,360 C100,270 0,360 -80,300 Z"
          fill="rgba(200,145,225,0.25)"
        />
      </svg>

      {/* keyframes injected via style tag */}
      <style>{`
        @keyframes wavePulse1 {
          0%   { opacity: 0.25; transform: translateY(0px) rotate(0deg); }
          100% { opacity: 0.45; transform: translateY(-12px) rotate(0.5deg); }
        }
        @keyframes wavePulse2 {
          0%   { opacity: 0.22; transform: translateY(0px) rotate(0deg); }
          100% { opacity: 0.42; transform: translateY(10px) rotate(-0.4deg); }
        }
      `}</style>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Routing (hash-based for payment pages) ────────────────────────────
  const [pathname, setPathname] = useState(window.location.pathname);
  const [view, setView] = useState<"store" | "delivery">("store");
  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (pathname === "/payment-success") return <PaymentSuccess />;
  if (pathname === "/payment-failure") return <PaymentFailure />;

  if (view === "delivery")
    return <DeliveryPortal onBack={() => setView("store")} />;

  // ── Main app ──────────────────────────────────────────────────────────
  return <MainApp onDeliveryPortal={() => setView("delivery")} />;
}

function MainApp({ onDeliveryPortal }: { onDeliveryPortal: () => void }) {
  const { data: fetchedProducts } = useGetAllProducts();
  const { data: fetchedCollections } = useGetAllCollections();
  const subscribe = useSubscribeEmail();
  const cart = useCart();
  const createCheckoutSession = useCreateCheckoutSession();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [email, setEmail] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [stripeKey, setStripeKey] = useState("");
  const [stripeCountries, setStripeCountries] = useState("IN");
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (!actor || !identity) return;
    Promise.all([actor.isCallerAdmin(), actor.isStripeConfigured()])
      .then(([admin, configured]) => {
        setIsAdmin(admin);
        setStripeConfigured(configured);
      })
      .catch(() => {});
  }, [actor, identity]);

  const handleSaveStripeConfig = async () => {
    if (!actor) return;
    setSavingConfig(true);
    try {
      await actor.setStripeConfiguration({
        secretKey: stripeKey,
        allowedCountries: stripeCountries
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setStripeConfigured(true);
      setAdminPanelOpen(false);
      toast.success("Stripe configured successfully!");
    } catch {
      toast.error("Failed to save Stripe config");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleStripeCheckout = async (items: ShoppingItem[]) => {
    const session = await createCheckoutSession.mutateAsync(items);
    if (session.url) {
      window.location.href = session.url;
    }
  };

  const products =
    fetchedProducts && fetchedProducts.length > 0
      ? fetchedProducts
      : SAMPLE_PRODUCTS;
  const collections =
    fetchedCollections && fetchedCollections.length > 0
      ? fetchedCollections
      : SAMPLE_COLLECTIONS;

  const filteredProducts = activeFilter
    ? products.filter((p) => p.collection === activeFilter)
    : products;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe.mutateAsync(email);
      toast.success("You're subscribed! Stay fresh 🌸");
      setEmail("");
    } catch {
      toast.success("You're subscribed! Stay fresh 🌸");
      setEmail("");
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    scrollTo(id);
  };

  const handleCollectionExplore = (colName: string) => {
    const slug =
      COLLECTION_SLUGS[colName] ?? colName.toLowerCase().replace(/ /g, "-");
    setActiveFilter(slug);
    scrollTo("best-sellers");
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  return (
    <div
      className="min-h-screen font-poppins relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(160deg, #C9A8E0 0%, #E8A8C8 55%, #F5C0D0 100%)",
      }}
    >
      <SilkWaves />

      <Toaster position="top-right" />

      <ProductModal
        product={selectedProduct}
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onAddToCart={cart.add}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cart.items}
        onStripeCheckout={handleStripeCheckout}
        isCheckingOut={createCheckoutSession.isPending}
        checkoutError={createCheckoutSession.error?.message ?? null}
      />

      {/* Stripe not configured banner */}
      {isAdmin && !stripeConfigured && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-semibold shadow-xl"
          style={{
            background: "rgba(200,80,0,0.9)",
            color: "#fff",
            border: "1px solid rgba(255,150,50,0.5)",
          }}
        >
          ⚠️ Stripe is not configured. Payments are disabled.{" "}
          <button
            type="button"
            className="underline ml-1"
            onClick={() => setAdminPanelOpen(true)}
          >
            Configure now
          </button>
        </div>
      )}

      {/* Admin panel dialog */}
      {adminPanelOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{
            background: "rgba(20,0,40,0.8)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setAdminPanelOpen(false)
          }
          data-ocid="admin.modal"
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(155,61,191,0.3)",
            }}
          >
            <h2
              className="font-black text-xl mb-1"
              style={{ color: "#1a1a2e" }}
            >
              Stripe Configuration
            </h2>
            <p className="text-sm mb-5" style={{ color: "#7B5A9A" }}>
              Configure your Stripe secret key to enable payments.
            </p>
            <div className="space-y-3 mb-5">
              <input
                type="password"
                placeholder="Stripe Secret Key (sk_live_...)"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                style={{
                  background: "rgba(237,217,247,0.5)",
                  border: "1px solid rgba(155,61,191,0.3)",
                  color: "#1a1a2e",
                }}
                data-ocid="admin.input"
              />
              <input
                type="text"
                placeholder="Allowed Countries (e.g. IN,US,GB)"
                value={stripeCountries}
                onChange={(e) => setStripeCountries(e.target.value)}
                className="w-full rounded-xl px-4 py-2 text-sm outline-none"
                style={{
                  background: "rgba(237,217,247,0.5)",
                  border: "1px solid rgba(155,61,191,0.3)",
                  color: "#1a1a2e",
                }}
                data-ocid="admin.input"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full py-2 text-sm font-semibold"
                style={{
                  background: "rgba(237,217,247,0.7)",
                  color: "#7C3AED",
                  border: "1px solid rgba(155,61,191,0.3)",
                }}
                onClick={() => setAdminPanelOpen(false)}
                data-ocid="admin.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-full py-2 text-sm font-bold text-white flex items-center justify-center gap-2"
                style={NEON_BTN}
                onClick={handleSaveStripeConfig}
                disabled={savingConfig || !stripeKey.trim()}
                data-ocid="admin.save_button"
              >
                {savingConfig ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Announcement bar ──────────────────────────────────────────────── */}
      <div
        className="text-center py-2 text-sm font-medium relative z-10"
        style={{ background: "#7B2D8B", color: "#fff" }}
      >
        🌸 Cosec — Gentle Fragrances for Teen Skin &nbsp;·&nbsp; Free shipping
        above ₹499
      </div>

      {/* ── Header / Nav ──────────────────────────────────────────────────── */}
      <header
        style={{
          background: "rgba(201, 168, 224, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(180, 130, 220, 0.2)",
        }}
        className="sticky top-0 z-40 shadow-xs"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-8">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo("shop-all")}
            style={{
              fontFamily: "'Dancing Script', cursive",
              color: "#fff",
              fontSize: "2rem",
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(120,40,160,0.3)",
              letterSpacing: "0.02em",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            data-ocid="nav.link"
          >
            Cosec
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {[
              { label: "Shop All", id: "shop-all" },
              { label: "Best Sellers", id: "best-sellers" },
              { label: "Brand Story", id: "brand-story" },
              { label: "Sensitive Skin", id: "sensitive-skin" },
              { label: "Contact", id: "contact" },
            ].map(({ label, id }) => (
              <a
                key={label}
                href={`#${id}`}
                className="text-sm font-semibold transition-colors"
                style={{ color: "rgba(255,255,255,0.85)" }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color =
                    "rgba(255,255,255,0.85)";
                }}
                onClick={(e) => handleNavClick(e, id)}
                data-ocid="nav.link"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Utility icons */}
          <div className="flex items-center gap-3 ml-auto">
            {isAdmin && (
              <button
                type="button"
                className="p-2 rounded-full transition-colors"
                style={{ color: "rgba(255,255,255,0.85)" }}
                aria-label="Admin Settings"
                onClick={() => setAdminPanelOpen(true)}
                data-ocid="nav.button"
                title="Admin: Stripe Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              className="p-2 rounded-full transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
              aria-label="Search"
              onClick={() => toast.info("Search coming soon! 🔍")}
              data-ocid="nav.button"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
              aria-label="Account"
              onClick={() => toast.info("Account coming soon! 👤")}
              data-ocid="nav.button"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
              aria-label="Wishlist"
              onClick={() => toast.info("Wishlist coming soon! 💜")}
              data-ocid="nav.button"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="relative p-2 rounded-full transition-colors"
              style={{ color: "rgba(255,255,255,0.85)" }}
              aria-label="Cart"
              onClick={() => setCartOpen((v) => !v)}
              data-ocid="nav.button"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.total > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                  style={{ background: "#9B3DBF" }}
                >
                  {cart.total}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mini cart dropdown */}
        <AnimatePresence>
          {cartOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-6 top-full mt-2 w-80 rounded-2xl shadow-lg z-50 p-4"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(180,130,220,0.2)",
              }}
              data-ocid="cart.popover"
            >
              <h3 className="font-bold mb-3" style={{ color: "#3D1A5A" }}>
                Your Cart
              </h3>
              {cart.items.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "#9B7AB0" }}
                  data-ocid="cart.empty_state"
                >
                  Your cart is empty.
                </p>
              ) : (
                <ul className="space-y-2">
                  {cart.items.map((item, idx) => (
                    <li
                      key={item.product.id.toString()}
                      className="flex justify-between text-sm"
                      data-ocid={`cart.item.${idx + 1}`}
                    >
                      <span
                        className="font-medium"
                        style={{ color: "#3D1A5A" }}
                      >
                        {item.product.name} ×{item.qty}
                      </span>
                      <span style={{ color: "#9B3DBF" }}>
                        ₹{Number(item.product.price) * item.qty}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {cart.items.length > 0 && (
                <Button
                  className="w-full mt-4 rounded-full text-white font-bold"
                  style={NEON_BTN}
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  data-ocid="cart.primary_button"
                >
                  Proceed to Checkout
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        id="shop-all"
        className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 max-w-xl"
        >
          <Badge
            className="mb-4 px-4 py-1 rounded-full font-semibold text-xs"
            style={{ background: "rgba(221,217,247,0.85)", color: "#5B3AED" }}
          >
            🌸 Made for Teen Skin
          </Badge>
          <h1
            className="font-black text-5xl md:text-6xl leading-tight mb-5"
            style={{ color: "#1a1a2e" }}
          >
            Smell fresh.
            <br />
            Feel{" "}
            <span
              style={{
                color: "#7C3AED",
                textShadow: "0 2px 12px rgba(124,58,237,0.25)",
              }}
            >
              confident.
            </span>
            <br />
            Every Day.
          </h1>
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: "#3D1A5A" }}
          >
            Cosec creates affordable, gentle perfumes designed for teenagers
            with sensitive skin. No harsh chemicals, no overwhelming strength —
            just the perfect everyday freshness.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button
              className="rounded-full px-8 py-3 text-sm font-bold text-white"
              style={NEON_BTN}
              onClick={() => scrollTo("best-sellers")}
              data-ocid="hero.primary_button"
            >
              Shop Our Collection
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-8 py-3 text-sm font-semibold"
              style={{
                borderColor: "#9B3DBF",
                color: "#7C3AED",
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => scrollTo("brand-story")}
              data-ocid="hero.secondary_button"
            >
              Our Story
            </Button>
          </div>
          <div className="mt-8 flex gap-6">
            {[
              { label: "Skin-Safe Formula" },
              { label: "Under ₹499" },
              { label: "Long-Lasting" },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#3D1A5A" }}
              >
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: "#9B3DBF" }}
                />
                {feat.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 w-full flex justify-center"
        >
          <div
            className="w-full max-w-md aspect-square relative overflow-hidden"
            style={{
              background: "rgba(221, 217, 247, 0.5)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(180, 130, 220, 0.3)",
              borderRadius: "0",
              boxShadow: "0 8px 48px rgba(120, 40, 180, 0.2)",
            }}
          >
            {/* Decorative perfume bottle shapes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Main bottle */}
                <div
                  className="w-20 h-32 mx-auto"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.7) 60%, rgba(155,61,191,0.3) 100%)",
                    backdropFilter: "blur(2px)",
                    border: "2px solid rgba(155,61,191,0.3)",
                    borderRadius: "12px",
                  }}
                />
                <div
                  className="w-8 h-5 rounded-t-lg mx-auto -mt-1"
                  style={{ background: "rgba(155,61,191,0.4)" }}
                />
                <div
                  className="w-5 h-3 rounded-t-full mx-auto"
                  style={{ background: "#9B3DBF" }}
                />
              </div>
            </div>
            {/* Floating decorations */}
            <div
              className="absolute top-8 right-8 w-16 h-16 rounded-full opacity-50"
              style={{ background: "rgba(247, 217, 232, 0.8)" }}
            />
            <div
              className="absolute bottom-10 left-8 w-12 h-12 rounded-full opacity-60"
              style={{ background: "rgba(221, 217, 247, 0.8)" }}
            />
            <div
              className="absolute top-1/3 left-4 w-8 h-8 rounded-full opacity-40"
              style={{ background: "rgba(245, 217, 239, 0.9)" }}
            />
            <div
              className="absolute bottom-6 right-6 text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #9B3DBF, #7C3AED)",
                boxShadow: "0 0 12px rgba(155,61,191,0.5)",
              }}
            >
              ✨ Teen Approved
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Shop by Collection ────────────────────────────────────────────── */}
      <section
        id="collections"
        className="py-16 relative z-10"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2
              className="font-extrabold text-3xl md:text-4xl"
              style={{ color: "#1a1a2e" }}
            >
              Shop by Collection
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#5B3A7A" }}>
              Find the scent that matches your vibe.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((col, idx) => {
              const style = COLLECTION_STYLES[idx % COLLECTION_STYLES.length];
              return (
                <motion.div
                  key={col.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-2xl p-8 flex flex-col gap-4 cursor-pointer transition-shadow hover:shadow-xl"
                  style={{
                    background: style.bg,
                    boxShadow: "0 2px 16px rgba(120,40,160,0.08)",
                  }}
                  data-ocid={`collections.item.${idx + 1}`}
                >
                  <h3
                    className="font-extrabold text-xl"
                    style={{ color: "#1a1a2e" }}
                  >
                    {col.name}
                  </h3>
                  <p className="text-sm flex-1" style={{ color: "#5B3A7A" }}>
                    {col.description}
                  </p>
                  <Button
                    className="rounded-full px-6 text-sm font-semibold w-fit text-white"
                    style={NEON_BTN}
                    onClick={() => handleCollectionExplore(col.name)}
                    data-ocid={`collections.button.${idx + 1}`}
                  >
                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Product Grid ──────────────────────────────────────────────────── */}
      <section
        id="best-sellers"
        className="py-16 relative z-10"
        style={{ background: "rgba(255,255,255,0.2)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2
              className="font-extrabold text-3xl md:text-4xl"
              style={{ color: "#1a1a2e" }}
            >
              Meet Your New Favourite Scents
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#5B3A7A" }}>
              All under ₹499 · Gentle on skin · Long-lasting freshness
            </p>
          </motion.div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                ...(activeFilter === null
                  ? NEON_BTN
                  : {
                      background: "rgba(237,217,247,0.7)",
                      border: "1px solid rgba(155,61,191,0.3)",
                    }),
                color: activeFilter === null ? "#fff" : "#7C3AED",
              }}
              data-ocid="products.tab"
            >
              All
            </button>
            {collections.map((col) => {
              const slug =
                COLLECTION_SLUGS[col.name] ??
                col.name.toLowerCase().replace(/ /g, "-");
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setActiveFilter(slug)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{
                    ...(activeFilter === slug
                      ? NEON_BTN
                      : {
                          background: "rgba(237,217,247,0.7)",
                          border: "1px solid rgba(155,61,191,0.3)",
                        }),
                    color: activeFilter === slug ? "#fff" : "#7C3AED",
                  }}
                  data-ocid="products.tab"
                >
                  {col.name}
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 ? (
            <p
              className="text-center py-12"
              style={{ color: "#9B7AB0" }}
              data-ocid="products.empty_state"
            >
              No products in this collection yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, idx) => {
                const tile = TILE_STYLES[idx % TILE_STYLES.length];
                const TileIcon = tile.icon;
                return (
                  <motion.div
                    key={product.id.toString()}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(180,130,220,0.2)",
                      boxShadow: "0 2px 16px rgba(120,40,160,0.08)",
                    }}
                    onClick={() => openProductModal(product)}
                    data-ocid={`products.item.${idx + 1}`}
                  >
                    {/* Product image */}
                    <div
                      className="w-full overflow-hidden relative"
                      style={{ height: "220px", background: tile.bg }}
                    >
                      {PRODUCT_IMAGES[product.id.toString()] ? (
                        <img
                          src={PRODUCT_IMAGES[product.id.toString()]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TileIcon
                            className="w-16 h-16 opacity-50"
                            style={{ color: "#9B3DBF" }}
                          />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(30,0,60,0.35)" }}
                      >
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full text-white"
                          style={NEON_BTN}
                        >
                          View Details
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3
                        className="font-bold text-base"
                        style={{ color: "#1a1a2e" }}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "#7B5A9A" }}>
                        {product.scentNotes} · {Number(product.sizeMl)}ml
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <span
                          className="font-extrabold text-lg"
                          style={{ color: "#7C3AED" }}
                        >
                          ₹{Number(product.price)}
                        </span>
                        <Button
                          size="sm"
                          className="rounded-full text-xs font-bold px-4 text-white"
                          style={NEON_BTN}
                          onClick={(e) => {
                            e.stopPropagation();
                            cart.add(product);
                          }}
                          data-ocid={`products.button.${idx + 1}`}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Brand Story ───────────────────────────────────────────────────── */}
      <section
        id="brand-story"
        className="py-16 relative z-10"
        style={{ background: "rgba(237,217,247,0.3)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          {/* Image placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div
              className="w-full aspect-video rounded-3xl flex items-center justify-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #EDD9F7 0%, #F5D9EF 60%, #DDD9F7 100%)",
              }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🌸</div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#7C3AED" }}
                >
                  Fresh · Gentle · Affordable
                </p>
              </div>
              <div
                className="absolute top-4 left-4 w-10 h-10 rounded-full opacity-50"
                style={{ background: "#F7D9E8" }}
              />
              <div
                className="absolute bottom-4 right-4 w-14 h-14 rounded-full opacity-40"
                style={{ background: "#EDD9F7" }}
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#9B3DBF" }}
            >
              Our Story
            </p>
            <h2
              className="font-extrabold text-3xl md:text-4xl mb-4"
              style={{ color: "#1a1a2e" }}
            >
              The Cosec Story
            </h2>
            <p className="font-bold text-lg mb-3" style={{ color: "#3D1A5A" }}>
              Born from real teenage struggles.
            </p>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "#5B3A7A" }}
            >
              We noticed teenagers struggling with sweat odour, unable to afford
              luxury perfumes and worried about harsh chemicals on their
              sensitive skin. Cosec was created to solve exactly that — gentle,
              dermatologist-tested fragrances at prices teens can actually
              afford.
            </p>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "#5B3A7A" }}
            >
              Every Cosec formula is alcohol-free, hypoallergenic and designed
              to last all day without overpowering those around you. Because
              smelling great shouldn't cost a fortune or come at the expense of
              your skin.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "Alcohol-Free",
                "Hypoallergenic",
                "Dermatologist Tested",
                "Cruelty-Free",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "#EDD9F7", color: "#7C3AED" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Sensitive Skin / Features section ─────────────────────────────── */}
      <section
        id="sensitive-skin"
        className="py-16 relative z-10"
        style={{ background: "rgba(255,255,255,0.25)" }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="font-extrabold text-3xl mb-4"
              style={{ color: "#1a1a2e" }}
            >
              Why Teens Love Cosec
            </h2>
            <p
              className="max-w-xl mx-auto mb-12 text-sm"
              style={{ color: "#5B3A7A" }}
            >
              We made Cosec with you in mind. Everything we do is designed for
              teenage skin and teenage budgets.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: "💸",
                title: "Pocket-Friendly Prices",
                desc: "All perfumes under ₹499 — because great scent shouldn't break the bank.",
              },
              {
                emoji: "🌸",
                title: "Gentle on Sensitive Skin",
                desc: "No alcohol, no harsh fixatives. Tested on sensitive skin by dermatologists.",
              },
              {
                emoji: "⏱️",
                title: "All-Day Freshness",
                desc: "Our micro-encapsulation technology releases fragrance gradually throughout the day.",
              },
            ].map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="p-8 rounded-2xl flex flex-col items-center text-center"
                style={{
                  background: "rgba(237,217,247,0.5)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(180,130,220,0.15)",
                }}
              >
                <div className="text-4xl mb-4">{feat.emoji}</div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: "#1a1a2e" }}
                >
                  {feat.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5B3A7A" }}
                >
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        id="contact"
        style={{ background: "rgba(232, 213, 245, 0.9)" }}
        className="pt-16 pb-8 relative z-10"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Logo + tagline */}
            <div>
              <div
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  color: "#7C3AED",
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Cosec
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#5B3A7A" }}
              >
                Gentle fragrances made for teenagers with sensitive skin.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4
                className="font-bold text-sm uppercase tracking-wider mb-4"
                style={{ color: "#7C3AED" }}
              >
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "Shop", action: () => scrollTo("best-sellers") },
                  { label: "About", action: () => scrollTo("brand-story") },
                  {
                    label: "FAQ",
                    action: () => toast.info("FAQ coming soon!"),
                  },
                  {
                    label: "Shipping",
                    action: () => toast.info("Shipping info coming soon!"),
                  },
                  {
                    label: "Ingredients",
                    action: () => toast.info("Ingredients page coming soon!"),
                  },
                  {
                    label: "Delivery Portal",
                    action: onDeliveryPortal,
                  },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={action}
                      className="text-sm transition-colors text-left"
                      style={{
                        color: "#5B3A7A",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = "#7C3AED";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = "#5B3A7A";
                      }}
                      data-ocid="footer.link"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-2">
              <h4
                className="font-bold text-base mb-1"
                style={{ color: "#1a1a2e" }}
              >
                Subscribe &amp; Stay Fresh
              </h4>
              <p className="text-sm mb-4" style={{ color: "#5B3A7A" }}>
                Get exclusive launches, tips &amp; offers straight to your
                inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full bg-white border-0 flex-1"
                  required
                  data-ocid="newsletter.input"
                />
                <Button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="rounded-full px-5 font-bold text-white"
                  style={NEON_BTN}
                  data-ocid="newsletter.submit_button"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
              {/* Social icons */}
              <div className="flex gap-4 mt-6">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "#9B3DBF" }}
                  data-ocid="footer.link"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "#9B3DBF" }}
                  data-ocid="footer.link"
                >
                  <SiTiktok className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "#9B3DBF" }}
                  data-ocid="footer.link"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div
            className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: "rgba(155,61,191,0.2)" }}
          >
            <p className="text-xs" style={{ color: "#7B5A9A" }}>
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#7C3AED" }}
              >
                caffeine.ai
              </a>
            </p>

            {/* Sensitive Skin Approved badge */}
            <div
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-center border-4 border-dashed"
              style={{
                borderColor: "#9B3DBF",
                background: "rgba(255,255,255,0.7)",
              }}
              title="Sensitive Skin Approved"
            >
              <Leaf className="w-6 h-6 mb-1" style={{ color: "#9B3DBF" }} />
              <span
                className="text-xs font-bold leading-tight"
                style={{ color: "#7C3AED" }}
              >
                Sensitive
                <br />
                Skin
                <br />
                Approved
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
