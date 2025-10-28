import React from 'react'
import Button from '../../../../ui/Button/Button'
import AddIcon from '../../../../assets/icons/AddIcon'
import PropTypes from 'prop-types'
const AddTransaction = ({children}) => {

    function handleClick() {

    }
  return (
    <Button icon={<AddIcon></AddIcon>} onClick={handleClick}>{children}</Button>
  )
}

AddTransaction.propTypes = {
    children: PropTypes.node
}

export default AddTransaction