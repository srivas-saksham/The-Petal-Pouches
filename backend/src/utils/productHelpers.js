/**
 * Calculate margin and markup percentages for products
 * Similar to bundleHelpers.js but simpler
 * 
 * Margin = ((Selling Price - Cost) / Selling Price) × 100
 * Markup = ((Selling Price - Cost) / Cost) × 100
 */

const calculateProductPricing = (costPrice, sellingPrice) => {
  const cost = parseFloat(costPrice) || 0;
  const price = parseFloat(sellingPrice) || 0;

  if (cost === 0 || price === 0) {
    return {
      margin_percent: null,
      markup_percent: null,
      profit: 0
    };
  }

  const profit = price - cost;
  const margin_percent = (profit / price) * 100;
  const markup_percent = profit > 0 && cost > 0 ? (profit / cost) * 100 : null;

  return {
    margin_percent: Math.round(margin_percent * 10) / 10, // 1 decimal
    markup_percent: markup_percent ? Math.round(markup_percent * 10) / 10 : null,
    profit
  };
};

module.exports = {
  calculateProductPricing
};