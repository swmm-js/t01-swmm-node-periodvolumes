// DemoCode.js
import { useState, useEffect } from "react"
import { UniversalDropDown } from "./UniversalDropDown"
import { SwmmDat } from "@fileops/swmm-node"
import './DemoCode.css'

export default function DemoCode({swmmData}) {
const [outText,  setOutText] = useState()
const [targetRG, setTargetRG] = useState()
const [periodType, setPeriodType] = useState('Year')
const [startDate, setStartDate] = useState()
const [endDate, setEndDate] = useState()

useEffect(()=>{
  // Read the .dat file and process the contents
  setOutText()
  let result = ''
  if(swmmData !== undefined && targetRG !== undefined){
    result = processOut(swmmData)
  }
  setOutText(result)
}, [swmmData, targetRG, periodType, startDate, endDate])

useEffect(()=>{
  if(swmmData !== undefined && targetRG !== undefined){
    // Automatically detect the date extents of the file.
    let keys = Object.keys(swmmData.contents[targetRG])
    let length = keys.length
    if(length && length > 0){
      let ds = new Date(parseInt(keys[0]))
      let de = new Date(parseInt(keys[length-1]))
      // Set time to 0 because nobody wants time from anywhere but 0.
      ds.setUTCHours(0);ds.setUTCMinutes(0);ds.setUTCSeconds(0)
      de.setUTCHours(0);de.setUTCMinutes(0);de.setUTCSeconds(0)
      setStartDate(ds)
      setEndDate(de)
    }
  }
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
    let outString = ''

    // Detect yearly rainfall using swmmNode
    let x = SwmmDat.sumEvents(
      swmmData.contents[targetRG], 
      new Date(startDate),
      new Date(endDate),
      periodType,
      1
    )

    // Format the output into something readable.
    outString +=
      columnHeaders([["ID", 10], ["Start", 24], ["End", 24], ["Volume", 10]])
    x.forEach((v, i) => {
      let sDate = new Date(v.start)
      let eDate = new Date(v.end)
      let sStringd = [sDate.getUTCMonth()+1, sDate.getUTCDate(),    sDate.getUTCFullYear()].map(o=>o.toString().padStart(2,'0')).join('/')
      let sStringt = [sDate.getUTCHours(),   sDate.getUTCMinutes(), sDate.getUTCSeconds() ].map(o=>o.toString().padStart(2,'0')).join(':')
      let eStringd = [eDate.getUTCMonth()+1, eDate.getUTCDate(),    eDate.getUTCFullYear()].map(o=>o.toString().padStart(2,'0')).join('/')
      let eStringt = [eDate.getUTCHours(),   eDate.getUTCMinutes(), eDate.getUTCSeconds() ].map(o=>o.toString().padStart(2,'0')).join(':')
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
        <div className="swmmForm">
          <div className="swmmRow">
            <label>Start:
              <input type="date" value={
                startDate?
                [startDate.getUTCFullYear(), (startDate.getUTCMonth()+1).toString().padStart(2,'0'), startDate.getUTCDate().toString().padStart(2,'0')].join('-')
                :undefined} onChange={(e)=>setStartDate(new Date(e.target.value))} className="UIparams"/> 
            </label>
            <label>End:
              <input type="date" value={
                endDate?
                [endDate.getUTCFullYear(), (endDate.getUTCMonth()+1).toString().padStart(2,'0'), endDate.getUTCDate().toString().padStart(2,'0')].join('-')
                :undefined} onChange={(e)=>setEndDate(new Date(e.target.value))} className="UIparams"/> 
            </label>
          </div>
        </div>
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

