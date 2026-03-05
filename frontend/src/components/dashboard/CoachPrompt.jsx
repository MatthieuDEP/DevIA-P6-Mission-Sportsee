import Image from "next/image";
import styles from "./CoachPrompt.module.css";

export default function CoachPrompt() {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <Image
          src="/IconeAI.png"
          alt="Coach AI"
          width={16}
          height={16}
        />

        <p className={styles.text}>
          Posez vos questions sur votre programme, vos performances ou vos objectifs.
        </p>
      </div>

      <button className={styles.button}>
        Lancer une conversation
      </button>
    </div>
  );
}