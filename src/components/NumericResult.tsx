import styles from "@/styles/Home.module.css";
import { calculateFontSize, formatTokenPrice } from "@/utils";

interface NumericResultProps {
  amount: number | null;
  isLoading: boolean;
  usdAmount: string;
}

export const NumericResult = ({
  amount,
  isLoading,
  usdAmount,
}: NumericResultProps) => {
  const isHidden =
    !usdAmount || usdAmount === "" || parseFloat(usdAmount) === 0;

  const fontSize =
    amount != null
      ? `${calculateFontSize(formatTokenPrice(amount))}px`
      : "36px";

  const displayValue =
    !isLoading && amount != null ? formatTokenPrice(amount) : "...";

  return (
    <p
      data-hidden={isHidden}
      className={styles.numericResult}
      style={{ fontSize }}
    >
      {displayValue}
    </p>
  );
};
