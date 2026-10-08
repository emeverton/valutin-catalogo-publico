import Image from "next/image";
import styles from "./ElephantMarquee.module.css";

const REPEATS_PER_GROUP = 5;

function ElephantGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.group} aria-hidden={duplicate || undefined}>
      {Array.from({ length: REPEATS_PER_GROUP }, (_, index) => (
        <div key={index} className={styles.item}>
          <Image
            src="/elefantes-valutin.png"
            alt=""
            width={3358}
            height={1143}
            sizes="(max-width: 767px) 180px, 250px"
            className={styles.elephants}
          />

          <span className={styles.signature}>
            <Image
              src="/logo-valutin.png"
              alt=""
              width={1024}
              height={295}
              sizes="(max-width: 767px) 82px, 112px"
              className={styles.logo}
            />
            <span className={styles.since}>Desde 1998</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ElephantMarquee() {
  return (
    <div id="elephant-marquee" className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        <ElephantGroup />
        <ElephantGroup duplicate />
      </div>
    </div>
  );
}
