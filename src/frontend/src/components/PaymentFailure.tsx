import { XCircle } from "lucide-react";
import { motion } from "motion/react";

const NEON_BTN: React.CSSProperties = {
  background: "linear-gradient(135deg, #9B3DBF, #7C3AED)",
  boxShadow:
    "0 0 15px rgba(232,121,249,0.8), 0 0 30px rgba(192,38,211,0.6), 0 0 60px rgba(192,38,211,0.3)",
  border: "2px solid rgba(232,121,249,0.9)",
};

export function PaymentFailure() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(160deg, #C9A8E0 0%, #E8A8C8 55%, #F5C0D0 100%)",
      }}
      data-ocid="payment_failure.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl p-10 text-center shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(232,121,249,0.4)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            bounce: 0.5,
            duration: 0.7,
            delay: 0.2,
          }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(200,30,60,0.15)",
              border: "2px solid rgba(255,100,130,0.5)",
              boxShadow: "0 0 24px rgba(255,100,130,0.3)",
            }}
          >
            <XCircle
              className="w-10 h-10"
              style={{ color: "rgba(255,100,130,1)" }}
            />
          </div>
        </motion.div>

        <h1 className="font-black text-3xl mb-3" style={{ color: "#1a1a2e" }}>
          Payment Failed
        </h1>
        <p
          className="text-base mb-8 leading-relaxed"
          style={{ color: "rgba(60,10,80,0.85)" }}
        >
          Something went wrong with your payment. No charges were made. Please
          try again.
        </p>

        <button
          type="button"
          className="w-full rounded-full px-8 py-3 text-white font-bold text-sm transition-transform hover:scale-105"
          style={NEON_BTN}
          onClick={() => {
            window.location.href = "/";
          }}
          data-ocid="payment_failure.primary_button"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
