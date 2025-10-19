/**
 * This util handles anything related to price formatting
 * it will set the appropriate decimal places based on the price
 * while also formatting the price to the user's locale
 * e.g. 1000.00000000 -> 1,000.00 for US, 1.000,00 for DE or 1 000,00 for FR
 * @param price - The price to format
 * @returns The formatted price
 */
export const formatTokenPrice = (price: number) => {
  switch (true) {
    case price >= 1_000_000_000:
      return new Intl.NumberFormat(undefined, {
        notation: "compact",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);

    case price < 0.01:
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      }).format(price);

    case price < 1:
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(price);

    default:
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
  }
};

/**
 * Calculates an "ideal" font size given a value.
 * This has been made so that we can gracefully handle large numbers
 * like big amounts of tokens, or lots of decimals.
 *
 * @param value - The value to calculate the font size for
 * @returns The font size
 */
export const calculateFontSize = (value: string): number => {
  const length = value.length;

  if (length <= 7) {
    return 36;
  }

  const fontSize = 36 - (length - 7) * 2.5;
  return Math.max(18, fontSize);
};
