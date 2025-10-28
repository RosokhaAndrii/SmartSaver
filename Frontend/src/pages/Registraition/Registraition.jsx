 // Auth.jsx
 import React from "react";
 import styles from './Registration.module.css'
 import FinancialInstituionIcon from '../../assets/icons/FinancialnstituionIcon.jsx';
 
 export default function Auth() {
     return(
         <div className={styles.Container}>
             <div className={styles.Logo}>
                 <span className={styles.Icon}>
                     <FinancialInstituionIcon />
                 </span>
                 <h1>SmartSaver</h1>
             </div>
 
             <div className={styles.authContainer}>
                 <form className={styles.Form}>
                     <label htmlFor="email" className={styles.Label}>Уведіть електронну пошту</label>
                     <input 
                         id="email" 
                         type="email" 
                         className={styles.Input} 
                         placeholder="Електронна пошта" 
                     />
 
                     <label htmlFor="password" className={styles.Label}>Уведіть пароль</label>
                     <input 
                         id="password" 
                         type="password" 
                         className={styles.Input} 
                         placeholder="Пароль" 
                         
                     />
                     <button className={styles.Button}>Зареєструватися</button>
                 </form>
                 
             </div>
             <div className={styles.link}>
                 <p>Уже маєте акаунт? <a href="#">Увійдіть!</a></p>
             </div>
         </div>
     )
 }