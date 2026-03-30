import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, Loader2, Package, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ShoppingItem } from "../backend";

const NEON_BTN: React.CSSProperties = {
  background: "linear-gradient(135deg, #9B3DBF, #7C3AED)",
  boxShadow:
    "0 0 15px rgba(232,121,249,0.8), 0 0 30px rgba(192,38,211,0.6), 0 0 60px rgba(192,38,211,0.3)",
  border: "2px solid rgba(232,121,249,0.9)",
};

type CartItem = {
  product: { id: bigint; name: string; price: bigint; description?: string };
  qty: number;
};

export interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onStripeCheckout: (
    items: ShoppingItem[],
    shippingForm: ShippingForm,
  ) => Promise<void>;
  isCheckingOut?: boolean;
  checkoutError?: string | null;
}

type Step = 1 | 2;

const EMPTY_FORM: ShippingForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export function CheckoutModal({
  open,
  onClose,
  cartItems,
  onStripeCheckout,
  isCheckingOut,
  checkoutError,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});

  const subtotal = cartItems.reduce(
    (s, i) => s + Number(i.product.price) * i.qty,
    0,
  );

  function validateForm(): boolean {
    const errs: Partial<ShippingForm> = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim()))
      errs.phone = "Enter a valid 10-digit phone";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim()))
      errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleProceedToPayment() {
    if (!validateForm()) return;
    const items: ShoppingItem[] = cartItems.map((item) => ({
      productName: item.product.name,
      currency: "inr",
      quantity: BigInt(item.qty),
      priceInCents: item.product.price * 100n,
      productDescription: item.product.description ?? "",
    }));
    await onStripeCheckout(items, form);
  }

  function handleClose() {
    setStep(1);
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  if (!open) return null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(20,0,40,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      data-ocid="checkout.modal"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.28 }}
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(232,121,249,0.3)",
          }}
        >
          {/* Header gradient strip */}
          <div
            className="w-full px-6 pt-6 pb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(155,61,191,0.6) 0%, rgba(124,58,237,0.4) 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-bold text-lg tracking-wide">
                Checkout
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
                data-ocid="checkout.close_button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-2" data-ocid="checkout.panel">
              {([1, 2] as Step[]).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background:
                        step >= s
                          ? "rgba(232,121,249,0.9)"
                          : "rgba(255,255,255,0.15)",
                      color: step >= s ? "#1a0030" : "rgba(255,255,255,0.6)",
                      boxShadow:
                        step === s ? "0 0 12px rgba(232,121,249,0.8)" : "none",
                    }}
                  >
                    {s}
                  </div>
                  {s < 2 && (
                    <div
                      className="h-0.5 w-10"
                      style={{
                        background:
                          step > s
                            ? "rgba(232,121,249,0.7)"
                            : "rgba(255,255,255,0.2)",
                      }}
                    />
                  )}
                </div>
              ))}
              <span className="ml-2 text-xs text-white/60">
                {step === 1 ? "Cart Review" : "Shipping & Payment"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {step === 1 && (
              <StepCart
                items={cartItems}
                subtotal={subtotal}
                onProceed={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepShipping
                form={form}
                errors={errors}
                isLoading={!!isCheckingOut}
                checkoutError={checkoutError ?? null}
                onChange={(k, v) => {
                  setForm((prev) => ({ ...prev, [k]: v }));
                  setErrors((prev) => ({ ...prev, [k]: undefined }));
                }}
                onProceedToPayment={handleProceedToPayment}
                onBack={() => setStep(1)}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Step 1: Cart Review ─────────────────────────────────────────────────────────────────
function StepCart({
  items,
  subtotal,
  onProceed,
}: {
  items: CartItem[];
  subtotal: number;
  onProceed: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag
          className="w-4 h-4"
          style={{ color: "rgba(232,121,249,0.9)" }}
        />
        <span className="text-white font-semibold">Your Items</span>
      </div>
      {items.length === 0 ? (
        <p
          className="text-white/50 text-sm mb-4"
          data-ocid="checkout.empty_state"
        >
          Your cart is empty.
        </p>
      ) : (
        <ul className="space-y-3 mb-4" data-ocid="checkout.list">
          {items.map((item, idx) => (
            <li
              key={item.product.id.toString()}
              className="flex justify-between items-center py-2 px-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.08)" }}
              data-ocid={`checkout.item.${idx + 1}`}
            >
              <div>
                <p className="text-white text-sm font-medium">
                  {item.product.name}
                </p>
                <p className="text-white/50 text-xs">Qty: {item.qty}</p>
              </div>
              <span className="text-pink-300 font-bold text-sm">
                ₹{Number(item.product.price) * item.qty}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div
        className="flex justify-between items-center py-3 px-3 rounded-xl mb-5"
        style={{
          background: "rgba(155,61,191,0.2)",
          border: "1px solid rgba(232,121,249,0.2)",
        }}
      >
        <span className="text-white/80 font-medium">Subtotal</span>
        <span className="text-pink-200 font-bold text-lg">₹{subtotal}</span>
      </div>
      <Button
        className="w-full rounded-full text-white font-bold flex items-center gap-2"
        style={NEON_BTN}
        onClick={onProceed}
        disabled={items.length === 0}
        data-ocid="checkout.primary_button"
      >
        Proceed to Shipping <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ── Step 2: Shipping + Payment ────────────────────────────────────────────────────────
function StepShipping({
  form,
  errors,
  onChange,
  onProceedToPayment,
  onBack,
  isLoading,
  checkoutError,
}: {
  form: ShippingForm;
  errors: Partial<ShippingForm>;
  onChange: (k: keyof ShippingForm, v: string) => void;
  onProceedToPayment: () => void;
  onBack: () => void;
  isLoading: boolean;
  checkoutError: string | null;
}) {
  const fieldStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(232,121,249,0.25)",
    color: "white",
  };

  return (
    <div>
      <div className="space-y-3 mb-5">
        <div>
          <Input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            style={fieldStyle}
            className="placeholder:text-white/40 rounded-xl"
            data-ocid="checkout.input"
          />
          {errors.fullName && (
            <p
              className="text-pink-400 text-xs mt-1"
              data-ocid="checkout.error_state"
            >
              {errors.fullName}
            </p>
          )}
        </div>
        <div>
          <Input
            placeholder="Phone (10 digits)"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            style={fieldStyle}
            className="placeholder:text-white/40 rounded-xl"
            data-ocid="checkout.input"
          />
          {errors.phone && (
            <p
              className="text-pink-400 text-xs mt-1"
              data-ocid="checkout.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>
        <div>
          <Input
            placeholder="Address Line 1"
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            style={fieldStyle}
            className="placeholder:text-white/40 rounded-xl"
            data-ocid="checkout.input"
          />
          {errors.address && (
            <p
              className="text-pink-400 text-xs mt-1"
              data-ocid="checkout.error_state"
            >
              {errors.address}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => onChange("city", e.target.value)}
              style={fieldStyle}
              className="placeholder:text-white/40 rounded-xl"
              data-ocid="checkout.input"
            />
            {errors.city && (
              <p
                className="text-pink-400 text-xs mt-1"
                data-ocid="checkout.error_state"
              >
                {errors.city}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => onChange("pincode", e.target.value)}
              style={fieldStyle}
              className="placeholder:text-white/40 rounded-xl"
              data-ocid="checkout.input"
            />
            {errors.pincode && (
              <p
                className="text-pink-400 text-xs mt-1"
                data-ocid="checkout.error_state"
              >
                {errors.pincode}
              </p>
            )}
          </div>
        </div>
      </div>

      {checkoutError && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm text-pink-300"
          style={{
            background: "rgba(200,30,60,0.2)",
            border: "1px solid rgba(255,100,130,0.3)",
          }}
          data-ocid="checkout.error_state"
        >
          ⚠️ {checkoutError}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="ghost"
          className="flex-1 rounded-full text-white/70 border border-white/20"
          onClick={onBack}
          disabled={isLoading}
          data-ocid="checkout.cancel_button"
        >
          Back
        </Button>
        <Button
          className="flex-1 rounded-full text-white font-bold"
          style={NEON_BTN}
          onClick={onProceedToPayment}
          disabled={isLoading}
          data-ocid="checkout.submit_button"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>

      {isLoading && (
        <p
          className="text-center text-white/50 text-xs mt-3"
          data-ocid="checkout.loading_state"
        >
          <Package className="w-3 h-3 inline mr-1" />
          Redirecting to secure payment...
        </p>
      )}
    </div>
  );
}
