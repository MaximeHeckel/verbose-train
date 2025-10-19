import styles from "@/styles/Home.module.css";
import { calculateFontSize, formatTokenPrice } from "@/utils";

interface NumericResultProps {
  amount: number | null;
  isLoading: boolean;
}

export const NumericResult = ({ amount, isLoading }: NumericResultProps) => {
  const fontSize =
    amount != null
      ? `${calculateFontSize(formatTokenPrice(amount))}px`
      : "36px";

  const displayValue = formatTokenPrice(amount || 0);

  return (
    <p
      data-loading={isLoading}
      className={styles.numericResult}
      style={{ fontSize }}
    >
      {displayValue}
    </p>
  );
};
