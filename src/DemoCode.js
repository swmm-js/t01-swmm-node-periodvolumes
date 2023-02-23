// DemoCode.js
import { useState, useEffect } from "react"
import { UniversalDropDown } from "./UniversalDropDown"
import { SwmmDat } from "@fileops/swmm-node"
import './DemoCode.css'

export default function DemoCode({swmmData}) {
const [outText,  setOutText] = useState()
const [targetRG, setTargetRG] = useState()
const [periodType, setPeriodType] = useState('Year')

useEffect(()=>{
  setOutText()
  let result = ''
  if(swmmData != null)
    result = processOut(swmmData)
  setOutText(result)
}, [swmmData, targetRG])

/**
 * Process the contents of a raingage .dat file
 * and detect storm patterns.
 * 
 * @param {swmmData} string text contents of a .dat file.
 * @returns {string} a formatted string that represents the storm events.
 */
function processOut(swmmData) {
  if(targetRG !== undefined && swmmData.contents[targetRG] !== undefined){
    let vol = Array()
    let outString = ''
    // Get the year extents of the file.
    let keys = Object.keys(swmmData.contents[targetRG])
    let startYear = new Date(parseInt(keys[0])).getFullYear()
    let endYear = new Date(parseInt(keys[keys.length-1])).getFullYear()
    // Detect yearly rainfall using swmmNode
    if(periodType === 'Year'){
      for(let year = startYear; year <= endYear; year++){
        vol.push({
          year: year, 
          vol: SwmmDat.stormVol(swmmData.contents[targetRG], new Date(Date.UTC(year, 0, 1, 0, 0, 0)), new Date(Date.UTC(year+1, 0, 1, 0, 0, 0)))})
      }
      
      // Format the storm volume JSON into readable output.
      outString = 
        columnHeaders([['Year', 10], ['Vol.', 24]])
      vol.forEach((v, i)=>{
        outString += v.year.toString().padEnd(10) +
                    v.vol.toFixed(1).padEnd(24) + '\n'
      })
    }
    // Detect monthly rainfall using swmmNode
    if(periodType === 'Month'){
      for(let year = startYear; year <= endYear; year++){
        for(let month = 0; month <= 11; month++){
          vol.push({
            year: year, 
            month: month+1, 
            vol: SwmmDat.stormVol(swmmData.contents[targetRG], new Date(Date.UTC(year, month, 1, 0, 0, 0)), new Date(Date.UTC(year, month+1, 1, 0, 0, 0)))})
        }
      }
      
      // Format the storm volume JSON into readable output.
      outString = 
        columnHeaders([['Year', 10], ['Month', 10], ['Vol.', 24]])
      vol.forEach((v, i)=>{
        outString += v.year.toString().padEnd(10) +
                     v.month.toString().padEnd(10) +
                     v.vol.toFixed(1).padEnd(24) + '\n'
      })
    }

    // Detect daily rainfall using swmmNode
    if(periodType === 'Day'){
      for(let year = startYear; year <= 1971/*endYear*/; year++){
        for(let month = 0; month <= 11; month++){
          // Get the count of days in this month by taking the 0th day of the next month.
          for(let day = 1; day <= new Date(year, month+1, 0).getDate(); day++){

            vol.push({
              year: year, 
              // JavaScript uses a base 0-index for month
              month: month + 1, 
              // JavaScript uses a base 1-index for day
              day: day,
              vol: SwmmDat.stormVol(swmmData.contents[targetRG], new Date(Date.UTC(year, month, day, 0, 0, 0)), new Date(Date.UTC(year, month, day+1, 0, 0, 0)))})
          }
        }
      }
      
      // Format the storm volume JSON into readable output.
      outString = 
        columnHeaders([['Year', 10], ['Month', 10], ['Day', 10], ['Vol.', 24]])
      vol.forEach((v, i)=>{
        outString += v.year.toString().padEnd(10) +
                     v.month.toString().padEnd(10) +
                     v.day.toString().padEnd(10) +
                     v.vol.toFixed(1).padEnd(24) + '\n'
      })
    }

    outString += '\n'

    return outString
  }
  else return ''
}

/**
 * Separate column headers and section contents with a set
 * of '-' characters and a newline
 * @param {columns} Array<Array<string, length>> represents the column name 
 * and the length of space given to the column
 * @returns {string} a string that represents the columns header.
 */
function columnHeaders(columns) {
  let len = 0;
  return columns.map(val=>{
    len = len + val[1]
    return val[0].padEnd(val[1])
  }).join('') + '\n' +
  '-'.repeat(len) + '\n'
}

if(outText)
  return (
    <>
    {
      swmmData &&
      <UniversalDropDown IDs={Object.keys(swmmData.contents)} onChange={setTargetRG} />
    }
    
    <pre style={{margin: '10px', overflow:'hidden'}}>
      {outText}
    </pre>
    </>
  )
else return (
  <>
  { swmmData &&
    <UniversalDropDown IDs={Object.keys(swmmData.contents)} onChange={setTargetRG} />
  }
  </>
)
}

