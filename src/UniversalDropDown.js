// UniversalDropDown.tsx
import { useState, useEffect } from "react"
import React from 'react'
import "./index.css"

// arr: Array of object that exist in the dropdown
// controlModel: the model that is being updated if this control is changed.
// objName: the name of the object to be updated in the controlModel object if this control is changed.
const UniversalDropDown = ({ IDs, onChange=()=>{} }) => {
  const [selected, setSelected] = useState('none')

  // If the model changes, then 
  // the displayed value must also change
  // Adjust for cases where val is null.
  useEffect(() => {
    setSelected('none')
    onChange(undefined)
  }, [])

  const handleChange = ({target}) =>{
    setSelected(target.value)
    onChange(target.value)
  }

  return(
    <>
      <select
        className='UIparams swmmDropDown'
        value = {selected}
        onChange = {handleChange}
      >
        <option value='none' disabled hidden>Select a Raingage</option>
        {
          IDs.map((k, i) => 
            <option className='UIparams' key={i} value={k}>{k}</option>
          )
        }
      </select>
    </>
  )
};
 
export {UniversalDropDown};