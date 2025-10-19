import styles from "@/styles/Home.module.css";
import { TokenSelect, TOKEN_LIST, TokenType } from "@/components/TokenSelect";
import { NumericResult } from "@/components/NumericResult";
import { NumericRatio } from "@/components/NumericRatio";

interface TokenRowProps {
  selectedToken: TokenType;
  tokenAmount: number | null;
  unitPrice: number | undefined;
  isLoading: boolean;
  onTokenChange: (token: TokenType) => void;
  ariaLabel: string;
  placeholder: string;
}

export const TokenRow = ({
  selectedToken,
  tokenAmount,
  unitPrice,
  isLoading,
  onTokenChange,
  ariaLabel,
  placeholder,
}: TokenRowProps) => {
  return (
    <div className={styles.resultWrapper}>
      <div
        style={{
          display: "flex",
          alignItems: "space-between",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          overflow: "hidden",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: "12px",
          }}
        >
          <TokenSelect
            ariaLabel={ariaLabel}
            placeholder={placeholder}
            value={selectedToken.symbol}
            onChange={(value) => {
              const token = TOKEN_LIST.find((t) => t.symbol === value);
              if (token) {
                onTokenChange(token);
              }
            }}
          />

          <div>
            <NumericResult amount={tokenAmount} isLoading={isLoading} />
          </div>
        </div>
        <NumericRatio
          tokenSymbol={selectedToken.symbol}
          unitPrice={unitPrice}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
