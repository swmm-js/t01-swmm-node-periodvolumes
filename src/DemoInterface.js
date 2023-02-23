// DemoInterface.js
import './App.css'
import DemoCode from './DemoCode'
import {useRef, useState} from 'react'
import { SwmmOut, SwmmDat } from "@fileops/swmm-node"

function DemoInterface() {
  // If this demo uses an input file, this ref is for selecting a new input file.
  const inputRef = useRef(null)
  // If this demo uses an output file, this ref is for selecting a new output file.
  const outputRef = useRef(null)
  // If this demo uses a dat file, this ref is for selecting a new dat file.
  const datRef = useRef(null)
  // Array Buffer containing data from the .out file.
  const [swmmArrBuff, setSwmmArrBuff] = useState(null)
  // Input string containing the contents of a .inp file.
  const [swmmInp, setSwmmInp] = useState(null)
  // Dat file for raingage or timeseries data.
  const [swmmDat, setSwmmDat] = useState(null)

  const handleInputClick = () => {
    // open file input box on click.
    inputRef.current.click()
  }

  const handleOutputClick = () => {
    // open file input box on click.
    outputRef.current.click()
  }

  const handleDatClick = () => {
    // open file input box on click.
    datRef.current.click()
  }

  const handleOutputFileChange = event => {
    const fileObj = event.target.files && event.target.files[0]

    if (!fileObj) return;

    event.target.value = null
  
    const reader = new FileReader()
    reader.onload = (e) => {
      const res = e.target.result
      setSwmmArrBuff(new SwmmOut(res))
    }
    reader.readAsArrayBuffer(fileObj)
  }

  const handleInputFileChange = event => {
    const fileObj = event.target.files && event.target.files[0]

    if (!fileObj) return;

    event.target.value = null
  
    const reader = new FileReader()
    reader.onload = (e) => {
      const res = e.target.result
      setSwmmInp(res)
    }
    reader.readAsText(fileObj)
  }

  const handleDatFileChange = event => {
    const fileObj = event.target.files && event.target.files[0]

    if (!fileObj) return;

    event.target.value = null
  
    const reader = new FileReader()
    reader.onload = (e) => {
      const res = e.target.result
      setSwmmDat(res)
    }
    reader.readAsText(fileObj)
  }

  const handleDemoOutputClick = event => {
    async function showFile () {
      // Read the output file
      const response = await fetch('./Example1.out')
      await response.arrayBuffer()
        .then((res)=>{
          setSwmmArrBuff(new SwmmOut(res))
      })
    }
    showFile()
  }

  const handleDemoDatClick = event => {
    async function showFile () {
      // Read the output file
      const response = await fetch('./Example1.dat')
      await response.text()
        .then((res)=>{
          setSwmmDat(new SwmmDat(res))
      })
    }
    showFile()
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* Invisible file selection box for .inp files. */}
        <input 
          style={{display: 'none'}}
          ref={inputRef}
          type="file"
          onChange={handleInputFileChange}
        />
        {/* Invisible file selection box for .out files. */}
        <input 
          style={{display: 'none'}}
          ref={outputRef}
          type="file"
          onChange={handleOutputFileChange}
        />
        {/* Invisible file selection box for .dat files. */}
        <input 
          style={{display: 'none'}}
          ref={datRef}
          type="file"
          onChange={handleDatFileChange}
        />
        <div className='demoTab'>
          <button className='demoTabLink'style={{width: '50%', border: '3px solid gray'}} onClick={handleDatClick}>Select .dat file</button>
          <button className='demoTabLink'style={{width: '50%', border: '3px solid gray'}} onClick={handleDemoDatClick}>Use demo Example1.dat</button>
        </div>
        <h3>swmmNode Results:</h3>
        <DemoCode swmmInp={swmmInp} setSwmmInp={setSwmmInp} swmmData={swmmDat} swmmArrBuff={swmmArrBuff}/>
      </header>
    </div>
  );
}

export default DemoInterface;
