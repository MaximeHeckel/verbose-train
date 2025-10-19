import * as Select from "@radix-ui/react-select";
import styles from "@/styles/Home.module.css";

export type TokenType = { name: string; symbol: string; chainId: string };

export const TOKEN_LIST = [
  { name: "ETH", symbol: "ETH", chainId: "8453" },
  { name: "USDC", symbol: "USDC", chainId: "1" },
  { name: "USDT", symbol: "USDT", chainId: "137" },
  { name: "WBTC", symbol: "WBTC", chainId: "1" },
];

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}

export const TokenSelect = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: TokenSelectProps) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger aria-label={ariaLabel} className={styles.SelectTrigger}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className={styles.SelectIcon}>{">"}</Select.Icon>
      </Select.Trigger>
      <Select.Content className={styles.SelectContent}>
        <Select.Viewport className={styles.SelectViewport}>
          {TOKEN_LIST.map((token) => (
            <Select.Item
              key={token.symbol}
              value={token.symbol}
              className={styles.SelectItem}
            >
              <Select.ItemText>
                {token.name} ({token.symbol})
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};
