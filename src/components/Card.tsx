import styles from "@/styles/Home.module.css";

const Card = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h1>{title}</h1>
      </div>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};

export default Card;
