// components/Footer.tsx
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Security</a>
        <a href="#">Status</a>
        <a href="#">Docs</a>
        <a href="#">Contact</a>
        <a href="#">Manage cookies</a>
        <a href="#">Do not share my personal information</a>
      </div>
      <div className={styles.copy}>
        <span>© 2025 Intellisia, Inc.</span>
      </div>
    </footer>
  )
}
