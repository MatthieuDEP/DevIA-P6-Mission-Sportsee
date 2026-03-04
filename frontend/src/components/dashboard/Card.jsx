import styles from "./Card.module.css";

export default function Card({
  title,
  subtitle,
  right,
  headerLeft,
  headerRight,
  bodyMinHeight = 210,
  children,
  className = "",
}) {
  const hasCustomHeader = headerLeft || headerRight;

  return (
    <section className={`${styles.card} ${className}`.trim()}>
      <header className={styles.header}>
        {hasCustomHeader ? (
          <>
            <div className={styles.left}>{headerLeft}</div>
            <div className={styles.right}>{headerRight}</div>
          </>
        ) : (
          <>
            <div className={styles.left}>
              <h2 className={styles.title}>{title}</h2>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
            </div>
            {right ? <div className={styles.right}>{right}</div> : null}
          </>
        )}
      </header>

      <div className={styles.body} style={{ minHeight: bodyMinHeight }}>
        {children}
      </div>
    </section>
  );
}