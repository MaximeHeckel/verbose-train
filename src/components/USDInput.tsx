import styles from "@/styles/Home.module.css";
import { IconDollarSign } from "@/components/Icons";

interface USDInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const USDInput = ({ value, onChange }: USDInputProps) => {
  return (
    <div className={styles.numberInputWrapper}>
      <label htmlFor="usd-amount">
        <IconDollarSign aria-label="Dollar sign" role="img" />
      </label>
      <input
        id="usd-amount"
        type="number"
        min="0.000001"
        step="any"
        className={styles.numberInput}
        placeholder="Enter USD amount"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
