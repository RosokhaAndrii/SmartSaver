import PropTypes from "prop-types";
import React from "react";
import styles from './UserProfile.module.css';

export default function UserProfile({userName = "Rosokha Andrii", imageSrc}) {
  const initials = userName ? userName.split(' ').map(n => n[0]).join('') : 'UA';

  return (
    <div className={styles.userProfileAvatar}>
      <div className={styles.avatarCircle}>
        {imageSrc ? (
          <img src={imageSrc} alt={`${userName}'s avatar`} className={styles.avatarImage} />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <span className={styles.userName}>{userName}</span>
    </div>
  );
}

UserProfile.propTypes = {
  userName: PropTypes.string,
  imageSrc: PropTypes.string
}