import styles from '../styles/navbar.module.scss'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className={styles.Wrapper}>
      <div className={'Shell'}>
        <div className={styles.Inner}>
          <Link href={'/'}>
            <a>Home</a>
          </Link>
        </div>
      </div>
    </nav>
  )
}