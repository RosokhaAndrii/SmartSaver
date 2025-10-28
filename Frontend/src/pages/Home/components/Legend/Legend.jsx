import React from 'react'
import PropTypes from 'prop-types' 
import styles from '../Legend/Legend.module.css';

export default function Legend({data}) {
    return(
       <ul className={styles.legendList}> 
    {data.map((item) => (
      <li key={item.name} className={styles.legendItem}>
        <span 
          className={styles.colorDot} 
          style={{ backgroundColor: item.color }} 
        ></span>
        {item.name} - {item.value}$
      </li>
    ))}
  </ul>
    )
}


const dataItemShape = PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired, 
    color: PropTypes.string.isRequired
});

Legend.propTypes = {
    data: PropTypes.arrayOf(dataItemShape).isRequired 
};