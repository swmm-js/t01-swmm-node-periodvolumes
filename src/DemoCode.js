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
 * Sum rainfall events and group by the periodType given
 * This is used to create yearly rainfall totals, monthly
 * statistics, or provide general error checking prior to 
 * utilizing swmmWasm and swmmLink for AI operations.
 * @param {IDatRecords} dataArray An instance of IDatRecords, the data for a gage in a .dat file.
 * @param {number} startTime The start time (UNIX epoch) of the records to check.
 * This can be prior to or after the events within dataArray.
 * @param {number} endTime The end time (UNIX epoch) of the records to check.
 * This can be prior to or after the events within dataArray.
 * @param {periodType} string idicator of the summation interval units. Can be 'Hour', 'Day', 'Month', 'Year' 
 * @param {periodValue} number Number of periodTypes that a summation interval will span. To get 6-hour intervals, use periodValue = 6 and periodType = 'Hour'
 * @returns {}
 */
function sumEvents(dataArray, startTime, endTime, periodType, periodValue) 
{
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
      periodFunc = (val) => {
        const newDate = new Date(val)
        newDate.setUTCMonth(val.getUTCMonth() + periodValue)
        return newDate
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
  let dEnd   = periodFunc(dStart)
  let pEnd   = dEnd.getTime()
  let i = 0
  // Set the start date to be after the first record, if possible
  while(pStart > theKeys[i] && pEnd > theKeys[i] && i < theLength){
    i++
  }
  // For every key
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
      dStart = new Date(pStart)
      dEnd   = periodFunc(dStart)
      pEnd   = dEnd.getTime()
      let valx = {
        start: pStart, 
        end:   pEnd,
        vol:   0
      }
      outArray.push(valx)
      pStart = pEnd
      dStart = new Date(pStart) 
      dEnd   = periodFunc(dStart)
      pEnd   = dEnd.getTime()
    }

    // While the key is between the start time and the end time
    for(; 
      i < theKeys.length && 
      new Date(theKeys[i]).getTime() < pEnd; 
      ){
        rainSum = rainSum + dataArray[theKeys[i].toString()]
        i++
        updated = 1
    }
    // Add the sum to the list of periods.
    if(updated){
      outArray.push({
        start: pStart, 
        end:   pEnd,
        vol:   rainSum
      })
      pStart = pEnd
      dStart = new Date(pStart)
      dEnd   = periodFunc(dStart)
      pEnd   = dEnd.getTime()
    }

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
      new Date(Date.UTC(1972, 1, 1, 0, 0, 0)).getTime(),
      "Month",
      1
      )
    // Detect yearly rainfall using swmmNode
    console.log(x)

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

