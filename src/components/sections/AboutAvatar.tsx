import Image from "next/image";

import styles from "./AboutAvatar.module.css";
import { getSiteAvatarUrl } from "../../lib/profile/avatar";

export default async function AboutAvatar() {
  const avatarSrc = (await getSiteAvatarUrl()) ?? "/avatar.svg";
  return (
    <div className={styles.wrapper} aria-label="GitHub avatar">
      <Image
        className={styles.image}
        src={avatarSrc}
        alt="Avatar"
        width={72}
        height={72}
        priority={false}
      />
    </div>
  );
}
