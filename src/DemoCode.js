// DemoCode.js
import { useState, useEffect } from "react"
import { UniversalDropDown } from "./UniversalDropDown"
import { SwmmDat } from "@fileops/swmm-node"
import { DateTime } from 'luxon'
import './DemoCode.css'

export default function DemoCode({swmmData}) {
const [outText,  setOutText] = useState()
const [targetRG, setTargetRG] = useState()
const [periodType, setPeriodType] = useState('Day')

useEffect(()=>{
  setOutText()
  let result = ''
  if(swmmData != null)
    result = processOut(swmmData)
  setOutText(result)
}, [swmmData, targetRG])

/**
 * Find the rainfall elements that classify as a storm due to having a volume that
 * meets or exceeds the MSV and has a length of IEP.
 * The results will exclude values that are exactly
 * Event Time + IEP, because Events are not considered instantaneous.
 * @param {IDatRecords} dataArray An instance of IDatRecords, the data for a gage in a .dat file.
 * @param {number} IEP Inter-event period, minimum time between classified storms
 * @param {number} MSV Minimum storm volume, the least amount of rain that can classify a storm
 * @returns 
 */
function sumEvents(dataArray, startTime, endTime, periodType, periodValue) {
  let outArray = []
  let periodFunc = ()=>{}

  // Adjust function for periodType:
  switch(periodType){
    case('Hour'):
      periodFunc = (val)=>{return new Date(val.setHours(val.getHours()+periodValue))}
      break;
    case('Day'):
      periodFunc = (val)=>{return new Date(val.setDate(val.getDate()+periodValue))}
      break;
    case('Month'):
    periodFunc = (val)=>{
      //console.log(val)
      let dt = DateTime.fromJSDate(val)
      dt = dt.plus({months:1})
      dt = dt.startOf('month')
      //console.log(dt)
      dt = dt.toJSDate()
      //console.log(dt)
      return dt
    }
      break;
    case('Year'):
      periodFunc = (val)=>{return new Date(val.setFullYear(val.getFullYear()+periodValue))}
      break
  }

  // Get the keys
  let theKeys = Object.keys(dataArray).map(v=>parseInt(v))
  let theLength = theKeys.length
  let pStart = startTime
  let dStart = new Date(pStart)
  console.log(dStart)
  let dEnd   = periodFunc(dStart)
  let pEnd   = dEnd.getTime()
  let i = 0
  // Set the start date to be after the first record, if possible
  console.log(theLength)
  while(pStart > theKeys[i] && pEnd > theKeys[i] && i < theLength){
    i++
  }
  // For every key
  console.log(theKeys[i])
  console.log(pStart)
  console.log(pEnd)
  console.log(endTime)
  // Error: If both startTime and endTime are in between valid keys,
  // then theKeys[i] will be greater than endTime  
  for (; i < theLength && pStart < endTime;){
    let keyTime = theKeys[i]
    let rainSum = 0
    let updated = 0;
    // If the key is not between the period start and period end
    // push a new object with no sum for the period start and period end
    // update the period start and period end
    // and check the next key
    // sum all the rainfall over the following IEP periods
    for(;pEnd < keyTime && pEnd < endTime;){
      //console.log(pStart)
      dStart = new Date(pStart)
      //console.log(dStart)
      //console.log(new Date(dStart))
      dEnd   = periodFunc(dStart)
      //console.log(dEnd)
      pEnd   = dEnd.getTime()
      let valx = {
        start: pStart, 
        end:   pEnd,
        vol:   0
      }
      //console.log(valx)
      outArray.push(valx)
      pStart = pEnd
      dStart = new Date(pStart) 
      dEnd   = periodFunc(dStart)
    }

    // While the key is between the start time and the end time
    for(; 
      i < theKeys.length && 
      new Date(theKeys[i]).getTime() < pEnd; 
      ){
        //console.log('==========================================')
        rainSum = rainSum + dataArray[theKeys[i].toString()]
        i++
        updated = 1
    }
    // Add the sum to the list of periods.
    if(updated){
      //console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
      console.log('===' + new Date(pStart))
      outArray.push({
        start: pStart, 
        end:   pEnd,
        vol:   rainSum
      })
      dEnd   = periodFunc(dStart)
      //console.log(dEnd)
      pEnd   = dEnd.getTime()
    }

    // Move time period forward
    pStart = pEnd
    dStart = new Date(pStart)
    dEnd   = periodFunc(dStart)//new Date(dStart.setHours(dStart.getHours()+periodValue))
    pEnd   = dEnd.getTime()

    // Move index forward
    if(!updated) i++
  }

  return outArray
}


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

    let x = sumEvents(
      swmmData.contents[targetRG], 
      new Date(Date.UTC(1971, 0, 1, 0, 0, 0)).getTime(),
      new Date(Date.UTC(1972, 0, 1, 0, 0, 0)).getTime(),
      "Month",
      1
      )
      console.log(x)
    // Detect yearly rainfall using swmmNode
    

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

