// DemoIntro.js
import "./index.css"
import { UIBackground } from './UIBackground'
import { SiteNavBar } from "./SiteNavBar"
import SyntaxHighlighter from 'react-syntax-highlighter'
import { nightOwl as codeStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import DemoInterface from './DemoInterface';
/* eslint import/no-webpack-loader-syntax: off */
const useDidMount = require('!!raw-loader!./DemoCode.js')

const DemoIntro = () => {
  return(
<div >
<SiteNavBar />
  <div >
    <div style={UIBackground}><h1>swmmNode: Rainfall by Period</h1>
      <p>This demo features swmmNode's ability to calculate a raingage's rainfall by period. Use this demo to identify yearly, monthly, or daily rainfall. If you want to identify individual storms, see the demo <a href="https://www.swmmreact.org/swmmReact/swmmNode_website_stormfinder/">here</a>.</p>
      
      <p>Click on the <strong>'Select .dat file'</strong> button to pick a <strong>.dat</strong> file and then choose a raingage to display these results. The demo file contains about 45 years of 15-minute data for one gage, and processes it in about 10 milliseconds. Keep in mind that web browsers can only handle so much memory, so if your <strong>.dat</strong> file is very large, you may want to use swmmNode via node.js.
      </p>
      <p>
        The results are a simple demo of one of the uses of swmmNode with raingage .dat files. You can find swmmNode compatible JavaScript below the translation, and you can always check out a copy of either swmmNode or swmmWasm for your own uses at the GitHub repo:
        </p>
        <p><a href='https://github.com/fileops/swmmNode'>https://github.com/fileops/swmmNode</a>
        </p> 
        <p>or from npm: </p>
        <p><a href='https://www.npmjs.com/package/@fileops/swmm-node'>https://www.npmjs.com/package/@fileops/swmm-node</a></p>
        <p>
        You can also contact me at <strong><a href="mailto:issac@swmmReact.org">issac@swmmReact.org</a></strong>. Thanks so much for taking the time to stop by.
        </p>

      <h2>Demo Controls</h2>
      <DemoInterface />

      <h2>Example swmmNode code</h2>
      <p>The following code window displays an example way to use swmmNode to analyze a raingage .dat file.</p>
      <SyntaxHighlighter language='javascript' style={codeStyle} showLineNumbers={true}>
        {useDidMount.default.toString()}
      </SyntaxHighlighter>
    </div>
  </div>
</div>)
}

export default DemoIntro;