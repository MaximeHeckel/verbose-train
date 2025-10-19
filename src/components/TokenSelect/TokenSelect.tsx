import * as Select from "@radix-ui/react-select";
import styles from "./TokenSelect.module.css";
import { IconChevronDown } from "../Icons";
import { TOKEN_LIST } from "@/constants";

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
      <Select.Trigger aria-label={ariaLabel} className={styles.selectTrigger}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className={styles.selectIcon}>
          <IconChevronDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Content className={styles.selectContent}>
        <Select.Viewport className={styles.selectViewport}>
          {TOKEN_LIST.map((token) => (
            <Select.Item
              key={token.symbol}
              value={token.symbol}
              className={styles.selectItem}
            >
              <Select.ItemText>{token.name}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};
