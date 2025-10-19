import styles from "@/styles/Home.module.css";
import { formatTokenPrice } from "@/utils";

interface NumericRatioProps {
  tokenSymbol: string;
  unitPrice: number | undefined;
  isLoading: boolean;
}

export const NumericRatio = ({
  tokenSymbol,
  unitPrice,
  isLoading,
}: NumericRatioProps) => {
  return (
    <p className={styles.ratio}>
      1 {isLoading ? "..." : tokenSymbol} ≈{" "}
      {isLoading ? "..." : formatTokenPrice(unitPrice || 0)} USD
    </p>
  );
};
