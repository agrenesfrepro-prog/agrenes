// ============================================================================
// AGRENES Market — Evri UK Delivery Calculator
// ============================================================================
// Real Evri Standard Courier Collection rates (high end of range for safety).
// Based on total order weight (sum of all products.weight_kg × quantity).
//
// USAGE:
//   import { calculateEvriDelivery } from '@/lib/evri-delivery';
//
//   const totalWeight = cartItems.reduce(
//     (sum, item) => sum + (item.product.weight_kg * item.quantity),
//     0
//   );
//
//   const delivery = calculateEvriDelivery(totalWeight);
//   // → { cost: 7.68, label: "Standard UK delivery", bulkContact: false }
//
//   if (delivery.bulkContact) {
//     // Show "Contact us for bulk quote" instead of a price
//   } else {
//     // Show delivery.cost as the delivery line item
//   }
// ============================================================================

/**
 * Calculate Evri delivery cost for a given total order weight.
 * @param {number} totalWeightKg - Sum of all items' weight × quantity
 * @returns {{ cost: number, label: string, bulkContact: boolean, band: string }}
 */
export function calculateEvriDelivery(totalWeightKg) {
  // Guard against invalid input
  if (typeof totalWeightKg !== 'number' || totalWeightKg < 0 || isNaN(totalWeightKg)) {
    return {
      cost: 0,
      label: 'Add items to see delivery',
      bulkContact: false,
      band: 'empty',
    };
  }

  // Empty cart
  if (totalWeightKg === 0) {
    return {
      cost: 0,
      label: 'Add items to see delivery',
      bulkContact: false,
      band: 'empty',
    };
  }

  // Weight bands — Evri Standard Courier Collection, high end of range
  if (totalWeightKg <= 1) {
    return {
      cost: 4.30,
      label: 'Standard UK delivery (2-3 working days)',
      bulkContact: false,
      band: 'under-1kg',
    };
  }
  if (totalWeightKg <= 2) {
    return {
      cost: 5.44,
      label: 'Standard UK delivery (2-3 working days)',
      bulkContact: false,
      band: '1-2kg',
    };
  }
  if (totalWeightKg <= 5) {
    return {
      cost: 7.58,
      label: 'Standard UK delivery (2-3 working days)',
      bulkContact: false,
      band: '2-5kg',
    };
  }
  if (totalWeightKg <= 10) {
    return {
      cost: 7.68,
      label: 'Standard UK delivery (2-3 working days)',
      bulkContact: false,
      band: '5-10kg',
    };
  }
  if (totalWeightKg <= 15) {
    return {
      cost: 11.29,
      label: 'Standard UK delivery (2-3 working days)',
      bulkContact: false,
      band: '10-15kg',
    };
  }
  if (totalWeightKg <= 20) {
    // Cheapest split: 2 × 10kg parcels
    return {
      cost: 15.36,
      label: 'Standard UK delivery (2 parcels, 2-3 working days)',
      bulkContact: false,
      band: '15-20kg',
    };
  }
  if (totalWeightKg <= 25) {
    // Cheapest split: 15kg + 10kg parcels
    return {
      cost: 18.97,
      label: 'Standard UK delivery (2 parcels, 2-3 working days)',
      bulkContact: false,
      band: '20-25kg',
    };
  }
  if (totalWeightKg <= 30) {
    // Cheapest split: 2 × 15kg parcels
    return {
      cost: 22.58,
      label: 'Standard UK delivery (2 parcels, 2-3 working days)',
      bulkContact: false,
      band: '25-30kg',
    };
  }

  // 30 kg+ = bulk territory, gets its own logistics
  return {
    cost: 0,
    label: 'Contact us for bulk shipping quote',
    bulkContact: true,
    band: 'bulk',
  };
}

/**
 * Helper: Calculate total order weight from a cart items array.
 * Assumes each item has: { product: { weight_kg: number }, quantity: number }
 * @param {Array} cartItems
 * @returns {number} Total weight in kg
 */
export function calculateTotalWeight(cartItems) {
  if (!Array.isArray(cartItems)) return 0;
  return cartItems.reduce((sum, item) => {
    const weight = Number(item?.product?.weight_kg) || 0;
    const qty = Number(item?.quantity) || 0;
    return sum + weight * qty;
  }, 0);
}

/**
 * Convenience wrapper: given cart items, return the delivery info directly.
 * @param {Array} cartItems
 * @returns {{ cost, label, bulkContact, band, totalWeightKg }}
 */
export function getCartDelivery(cartItems) {
  const totalWeightKg = calculateTotalWeight(cartItems);
  const delivery = calculateEvriDelivery(totalWeightKg);
  return {
    ...delivery,
    totalWeightKg: Math.round(totalWeightKg * 100) / 100,
  };
}

// ============================================================================
// DEV TEST BLOCK — run with `node evri-delivery.js` to see all bands
// ============================================================================
// Uncomment to test locally:
//
// const testWeights = [0, 0.5, 1, 1.5, 5, 7.5, 10, 12, 15, 17, 22, 27, 30, 45];
// console.log('Weight (kg) | Delivery | Label');
// console.log('------------+----------+----------------------------------');
// testWeights.forEach(w => {
//   const d = calculateEvriDelivery(w);
//   const priceStr = d.bulkContact ? 'CONTACT' : `£${d.cost.toFixed(2)}`;
//   console.log(`  ${String(w).padStart(9)} | ${priceStr.padStart(8)} | ${d.label}`);
// });
