import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  LogIn,
  LogOut,
  Package,
  Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NEON_BTN: React.CSSProperties = {
  background: "linear-gradient(135deg, #9B3DBF, #7C3AED)",
  boxShadow:
    "0 0 15px rgba(232,121,249,0.8), 0 0 30px rgba(192,38,211,0.6), 0 0 60px rgba(192,38,211,0.3)",
  border: "2px solid rgba(232,121,249,0.9)",
};

type OrderStatus = "Pending" | "Out for Delivery" | "Delivered";

interface MockOrder {
  id: string;
  customer: string;
  address: string;
  items: { name: string; qty: number }[];
  status: OrderStatus;
}

const INITIAL_ORDERS: MockOrder[] = [
  {
    id: "CSC-1042",
    customer: "Priya Sharma",
    address: "14, Rose Garden Lane, Sector 12, Noida, UP 201301",
    items: [
      { name: "Daily Dew", qty: 2 },
      { name: "Aqua Bloom", qty: 1 },
    ],
    status: "Pending",
  },
  {
    id: "CSC-1041",
    customer: "Aryan Mehta",
    address: "B-72, Sunflower Apartments, Andheri West, Mumbai 400058",
    items: [{ name: "Sport Rush", qty: 1 }],
    status: "Out for Delivery",
  },
  {
    id: "CSC-1040",
    customer: "Neha Kapoor",
    address: "3rd Floor, Lotus Tower, MG Road, Bengaluru 560001",
    items: [
      { name: "Petal Calm", qty: 1 },
      { name: "Vanilla Haze", qty: 1 },
    ],
    status: "Pending",
  },
  {
    id: "CSC-1039",
    customer: "Rohan Verma",
    address: "22, Green Park Extension, New Delhi 110016",
    items: [{ name: "Midnight Bloom", qty: 1 }],
    status: "Delivered",
  },
  {
    id: "CSC-1038",
    customer: "Simran Bhatia",
    address: "Plot 9, Jubilee Hills, Hyderabad, Telangana 500033",
    items: [
      { name: "Candy Cloud", qty: 2 },
      { name: "Fresh Kick", qty: 1 },
    ],
    status: "Out for Delivery",
  },
  {
    id: "CSC-1037",
    customer: "Karan Singh",
    address: "77, Salt Lake Sector V, Kolkata, WB 700091",
    items: [{ name: "Daily Dew", qty: 1 }],
    status: "Delivered",
  },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    color: string;
    bg: string;
    icon: React.ElementType;
    next: OrderStatus | null;
    nextLabel: string | null;
  }
> = {
  Pending: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.15)",
    icon: Package,
    next: "Out for Delivery",
    nextLabel: "Mark Out for Delivery",
  },
  "Out for Delivery": {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.15)",
    icon: Truck,
    next: "Delivered",
    nextLabel: "Mark Delivered",
  },
  Delivered: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.15)",
    icon: CheckCircle2,
    next: null,
    nextLabel: null,
  },
};

export function DeliveryPortal({ onBack }: { onBack: () => void }) {
  const { login, clear, loginStatus, identity, isLoggingIn } =
    useInternetIdentity();
  const [orders, setOrders] = useState<MockOrder[]>(INITIAL_ORDERS);

  const isLoggedIn = !!identity;

  const advanceStatus = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = STATUS_CONFIG[o.status].next;
        return next ? { ...o, status: next } : o;
      }),
    );
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1a0830 0%, #2d1050 50%, #1e0a40 100%)",
      }}
    >
      {/* Subtle wave bg */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.3) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(26,8,48,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(155,61,191,0.3)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: "rgba(220,180,255,0.8)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#e8b4ff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              "rgba(220,180,255,0.8)";
          }}
          data-ocid="delivery.link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <div
          style={{
            fontFamily: "'Dancing Script', cursive",
            color: "#c084fc",
            fontSize: "1.5rem",
            fontWeight: 700,
          }}
        >
          Cosec
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span
                className="text-xs font-mono px-2 py-1 rounded-lg hidden sm:block"
                style={{
                  color: "rgba(196,132,252,0.8)",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}
              >
                {identity.getPrincipal().toString().slice(0, 10)}…
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs gap-1"
                style={{
                  borderColor: "rgba(155,61,191,0.5)",
                  color: "#c084fc",
                  background: "rgba(124,58,237,0.1)",
                }}
                onClick={clear}
                data-ocid="delivery.secondary_button"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </>
          ) : null}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="font-extrabold text-3xl mb-1"
            style={{ color: "#f0d4ff" }}
          >
            Delivery Portal
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "rgba(196,132,252,0.7)" }}
          >
            Manage and update delivery statuses for Cosec orders.
          </p>
        </motion.div>

        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-10 flex flex-col items-center text-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(155,61,191,0.3)",
            }}
            data-ocid="delivery.card"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ background: "rgba(124,58,237,0.2)" }}
            >
              <Truck className="w-8 h-8" style={{ color: "#c084fc" }} />
            </div>
            <h2 className="font-bold text-xl mb-2" style={{ color: "#f0d4ff" }}>
              Staff Login Required
            </h2>
            <p
              className="text-sm mb-8 max-w-xs"
              style={{ color: "rgba(196,132,252,0.7)" }}
            >
              Please log in with your Internet Identity to access the delivery
              dashboard.
            </p>
            <Button
              className="rounded-full px-8 py-3 font-bold text-white gap-2"
              style={NEON_BTN}
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="delivery.primary_button"
            >
              {isLoggingIn ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? "Connecting…" : "Login with Internet Identity"}
            </Button>
            {loginStatus === "loginError" && (
              <p
                className="mt-4 text-xs"
                style={{ color: "#F87171" }}
                data-ocid="delivery.error_state"
              >
                Login failed. Please try again.
              </p>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {orders.map((order, idx) => {
                const cfg = STATUS_CONFIG[order.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="rounded-2xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(155,61,191,0.25)",
                    }}
                    data-ocid={`delivery.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="font-mono text-sm font-bold"
                            style={{ color: "#c084fc" }}
                          >
                            #{order.id}
                          </span>
                          <span
                            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.color}44`,
                            }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {order.status}
                          </span>
                        </div>
                        <p
                          className="font-semibold text-base"
                          style={{ color: "#f0d4ff" }}
                        >
                          {order.customer}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(196,132,252,0.6)" }}
                        >
                          {order.address}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {order.items.map((item) => (
                            <span
                              key={item.name}
                              className="text-xs px-2.5 py-1 rounded-lg"
                              style={{
                                background: "rgba(124,58,237,0.15)",
                                color: "rgba(220,180,255,0.9)",
                                border: "1px solid rgba(124,58,237,0.25)",
                              }}
                            >
                              {item.name} ×{item.qty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {cfg.nextLabel && (
                        <Button
                          size="sm"
                          className="rounded-full text-xs font-bold text-white flex-shrink-0 mt-1"
                          style={NEON_BTN}
                          onClick={() => advanceStatus(order.id)}
                          data-ocid={`delivery.button.${idx + 1}`}
                        >
                          {cfg.nextLabel}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </main>

      <footer
        className="text-center py-8 text-xs relative z-10"
        style={{ color: "rgba(196,132,252,0.4)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(196,132,252,0.6)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
