import styles from "@/styles/Home.module.css";
import { IconDollarSign } from "@/components/Icons";

interface USDInputProps {
  value: string;
  onChange: (value: string) => void;
}

const INVALID_CHARACTERS = ["e", "E", "-", "+"];

export const USDInput = ({ value, onChange }: USDInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("newValue", newValue);

    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block 'e', 'E', '-', and '+' which are technically allowed here
    // but can let users type invalid numbers
    if (INVALID_CHARACTERS.includes(e.key)) {
      console.error(`Invalid character blocked: "${e.key}"`);
      e.preventDefault();
    }
  };

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
        placeholder="Enter USD amount"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
