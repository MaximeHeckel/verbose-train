import styles from "./NumericRatio.module.css";
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
    <p data-loading={isLoading} className={styles.ratio}>
      1 {tokenSymbol} ≈ {formatTokenPrice(unitPrice || 0)} USD
    </p>
  );
};
