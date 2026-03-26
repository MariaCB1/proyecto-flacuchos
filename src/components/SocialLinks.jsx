import styles from './SocialLinks.module.css';

const socialLinks = [
    { href: 'https://www.instagram.com/ayudaunflacucho/', img: '/img/logo-instagram.png', alt: 'Instagram' },
    { href: 'https://www.facebook.com/ayudaunflacucho', img: '/img/logo-facebook.png', alt: 'Facebook' },
    { href: 'https://www.teaming.net/group/list?q=flacuchos', img: '/img/logo-teaming.png', alt: 'Teaming' },
];

function SocialLinks({ className = '' }) {
    return (
        <div className={`${styles.socialLinks} ${className}`}>
            {socialLinks.map((link, idx) => (
                <a 
                    key={idx}
                    href={link.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={link.img} alt={link.alt} />
                </a>
            ))}
        </div>
    );
}

export default SocialLinks;
