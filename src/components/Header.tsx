// src/components/Header.tsx
import styles from './Header.module.css'

export default function Header() {
    return (
        <nav className={styles.nav}>
            <div className={styles.logo}>Intellisia🥕</div>
            <div className={styles.navRight}>
                <div className={styles.profile}>
                </div>
            </div>
        </nav>
    )
}
