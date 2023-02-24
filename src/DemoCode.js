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
}, [swmmData, targetRG, periodType])

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

    let x = SwmmDat.sumEvents(
      swmmData.contents[targetRG], 
      new Date(Date.UTC(1971, 0, 1, 0, 0, 0)).getTime(),
      new Date(Date.UTC(1972, 1, 1, 0, 0, 0)).getTime(),
      periodType,
      1
    )
    // Detect yearly rainfall using swmmNode
    console.log(x)
    outString +=
      columnHeaders([["ID", 10], ["Start", 24], ["End", 24], ["Volume", 10]])
    x.forEach((v, i) => {
      let sDate = new Date(v.start)
      let eDate = new Date(v.end)
      let sStringd = [sDate.getUTCMonth()+1, sDate.getUTCDate(), sDate.getUTCFullYear()].map(o=>o.toString().padStart(2,'0')).join('/')
      let sStringt = [sDate.getUTCHours(), sDate.getUTCMinutes(), sDate.getUTCSeconds()].map(o=>o.toString().padStart(2,'0')).join(':')
      let eStringd = [eDate.getUTCMonth()+1, eDate.getUTCDate(), eDate.getUTCFullYear()].map(o=>o.toString().padStart(2,'0')).join('/')
      let eStringt = [eDate.getUTCHours(), eDate.getUTCMinutes(), eDate.getUTCSeconds()].map(o=>o.toString().padStart(2,'0')).join(':')
      outString += [
        i.toString().padEnd(10),
        (sStringd + ' ' + sStringt).padEnd(24),
        (eStringd + ' ' + eStringt).padEnd(24),
        v.vol.toFixed(2).padEnd(10)
      ].join('') + '\n'
    })

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
    console.log(val)
    return val[0].padEnd(val[1])
  }).join('') + '\n' +
  '-'.repeat(len) + '\n'
}

if(outText)
  return (
    <>
    {
      swmmData &&
      <>
      <label>Raingage:
        <UniversalDropDown IDs={Object.keys(swmmData.contents)} onChange={setTargetRG} /> 
      </label>
      <label>Period:
        <UniversalDropDown IDs={['Year', 'Month', 'Day', 'Hour']} onChange={setPeriodType} /> 
      </label>
      </>
    }
    
    <pre style={{margin: '10px', overflow:'hidden'}}>
      {outText}
    </pre>
    </>
  )
else return (
  <>
  { swmmData &&
    <>
    <label>Raingage:
      <UniversalDropDown IDs={Object.keys(swmmData.contents)} onChange={setTargetRG} /> 
    </label>
    <label>Period:
      <UniversalDropDown IDs={['Year', 'Month', 'Day', 'Hour']} onChange={setPeriodType} /> 
    </label>
    </>
  }
  </>
)
}

