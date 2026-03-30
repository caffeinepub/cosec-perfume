# Cosec Perfume

## Current State
Full e-commerce site with product grid, detail modals, cart, 3-step checkout, Stripe payments. Products are hardcoded with placeholder image fields. No delivery executive feature exists.

## Requested Changes (Diff)

### Add
- Aesthetic AI-generated product images assigned to each product in the product grid and detail modal
- Delivery Executive portal: a dedicated page/view accessible via a hidden route or a small link in the footer, where delivery staff can log in (via Internet Identity) and see a list of orders with customer name, address, items, and order status (Pending / Out for Delivery / Delivered). They can update status of each order.

### Modify
- Each product in the hardcoded products array gets an `image` field pointing to one of the 8 generated perfume images
- Product cards in the grid display the actual image prominently
- Product detail modal shows the image

### Remove
- Nothing removed

## Implementation Plan
1. Map each of the 8 products to one of the generated images:
   - Lavender Dream → /assets/generated/perfume-lavender-dream.dim_600x700.jpg
   - Rose Blush → /assets/generated/perfume-rose-blush.dim_600x700.jpg
   - Ocean Mist → /assets/generated/perfume-ocean-mist.dim_600x700.jpg
   - Jasmine White → /assets/generated/perfume-jasmine-white.dim_600x700.jpg
   - Vanilla Warmth → /assets/generated/perfume-vanilla-warmth.dim_600x700.jpg
   - Fresh Green → /assets/generated/perfume-fresh-green.dim_600x700.jpg
   - Rose Oud → /assets/generated/perfume-rose-oud.dim_600x700.jpg
   - Sakura Bloom → /assets/generated/perfume-sakura-bloom.dim_600x700.jpg
2. Update product card UI to show the image (tall card with image at top, details below)
3. Update product detail modal to show the image
4. Add a DeliveryPortal component at route /delivery (or accessible via footer link "Delivery Portal")
5. DeliveryPortal: shows a list of mock/stored orders, delivery staff can update status (Pending → Out for Delivery → Delivered)
6. Backend: add getOrders and updateOrderStatus methods, or use frontend-only mock orders list for now
