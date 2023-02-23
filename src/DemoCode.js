// DemoCode.js
import { useState, useEffect } from "react"
import { UniversalDropDown } from "./UniversalDropDown"
import { SwmmDat } from "@fileops/swmm-node"
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
  // Get the keys
  let theKeys = Object.keys(dataArray).map(v=>parseInt(v))
  let theLength = theKeys.length
  let pStart = startTime
  let pEnd   = startTime

  // For every key
  for (let i = 0; i < theLength && theKeys[i] < endTime && pStart < endTime;){
    //console.log(new Date(theKeys[i]))
    let key = theKeys[i]
    let rainSum = 0
    let thisTime = key
    let updated = 0;
    // If the key is not between the period start and period end
    // push a new object with no sum for the period start and period end
    // update the period start and period end
    // and check the next key
    // sum all the rainfall over the following IEP periods
    for(let dStart = new Date(pStart), 
        dEnd   = new Date(dStart.setHours(dStart.getHours()+periodValue))
        ;
        pEnd < thisTime
        ;
        pStart = pEnd, 
        dStart = new Date(pStart), 
        dEnd   = new Date(dStart.setHours(dStart.getHours()+periodValue)),
        pEnd   = dEnd.getTime()){
          /*console.log('roll')
          console.log('roll')
          console.log('roll')
          console.log('roll')*/
          outArray.push({
            start: pStart, 
            end:   pEnd,
            vol:   0
          })
    }

    // While the key is between the start time and the end time
    for(; 
      i < theKeys.length && 
      new Date(theKeys[i]).getTime() < pEnd; 
      ){
        //console.log('======================================================')
        rainSum = rainSum + dataArray[theKeys[i].toString()]
        i++
        updated = 1
    }
    // Add the sum to the list of periods.
    outArray.push({
      start: pStart, 
      end:   pEnd,
      vol:   rainSum
    })

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
      new Date(Date.UTC(1970, 0, 1, 0, 0, 0)).getTime(),
      new Date(Date.UTC(2013, 0, 1, 0, 0, 0)).getTime(),
      "Hour",
      24
      )
      console.log(x)
    // Detect yearly rainfall using swmmNode
    /*if(periodType === 'Year'){
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
      for(let year = startYear; year <= endYear; year++){
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
    }*/

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

