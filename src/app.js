// /////// //
// IMPORTS //
// /////// //
import isSVG from 'is-svg'
import {optimize} from 'svgo'
import SVGPathExtractor from 'extract-svg-path'

// //////////// //
// DOM ELEMENTS //
// //////////// //
const uploadContainer = document.querySelector('.upload')
const uploadInput = document.querySelector('.upload-input')
const uploadArea = document.querySelector('.upload-area')
const uploadLabel = document.querySelector('.upload-label')
const uploadFileName = document.querySelector('.upload-file-name')

const warningContainer = document.querySelector('.upload-warning')
const warningText = document.querySelector('.upload-warning--text')

const myrtilleContainer = document.querySelector('.myrtille')
const myrtilleString = document.querySelector('.myrtille-string')

const resetButton = document.querySelector('.restart-button ')
const goButton = document.querySelector('.go-button ')
const copyButton = document.querySelector('.copy-button ')

// /////////// //
// VARIOUS VAR //
// /////////// //
let fileIsHere = false
let SVGFileInfo
let SVGContent
let SVGViewbox
let SVGPath
let myrtille

// ///////// //
// FUNCTIONS //
// ///////// //
/**
 * Trigger functions depending on event
 */
function addFilesFromBrowse() {
  SVGFileInfo = [...uploadInput.files][0]
  addFileNameToDom()
}

/**
 * Trigger functions depending on event
 * @param {object} event - the targeted element by event
 */
function addFilesFromDrop(event) {
  event.stopPropagation()
  event.preventDefault()
  SVGFileInfo = [...event.dataTransfer.files][0]
  addFileNameToDom()
}

/**
 * Add class for icon tranformation when file is dragged over  drop area
 */
function dragFileOver(event) {
  event.stopPropagation()
  event.preventDefault()
  uploadLabel.className = 'upload-label animate-fast dropZoom'
}

/**
 * Remove class for icon tranformation when file is dragged outside drop area
 */
function dragFileOutside(event) {
  event.stopPropagation()
  event.preventDefault()
  uploadLabel.className = 'upload-label'
}

/**
 * Clear the dom and paint new file with updated data
 * add associated css classes to elements that needs to be displayed
 */
function addFileNameToDom() {
  const isFileOK = checkFile()

  if (isFileOK) {
    uploadFileName.innerHTML = SVGFileInfo.name
    uploadFileName.className = 'upload-file-name displayed'
    uploadLabel.style = 'display: none'
    fileIsHere = true
  }
}

/**
 * Simply check if the file a SVG or not
 * @returns {Boolean} true if the file is a SVG
 */
function checkFile() {
  const reader = new FileReader()

  // Check file extension
  if (SVGFileInfo.type !== 'image/svg+xml') {
    warningContainer.className = 'upload-warning displayed'
    warningText.innerHTML = 'this is not a SVG file'
    return false
  }

  // Check file info
  if (!SVGFileInfo) {
    warningContainer.className = 'upload-warning displayed'
    warningText.innerHTML = 'there is an error with the file'
    return false
  }

  // Check file content
  reader.addEventListener('load', event => {
    if (!isSVG(event.target.result)) {
      warningContainer.className = 'upload-warning displayed'
      warningText.innerHTML = 'this is not a clean SVG file'
      return false
    }

    SVGContent = event.target.result
  })

  reader.readAsText(SVGFileInfo)

  return true
}

/**
 * Reload the page and reset SVG upload
 */
function resetPage() {
  window.location.reload()
}

/**
 * Generate a myrtille string from a SVG file
 */
function generateMyrtille() {
  const optimizedSVG = optimize(SVGContent, {multipass: true})

  if (!fileIsHere) {
    warningContainer.className = 'upload-warning displayed'
    warningText.innerHTML = 'hmmm there is no SVG here'

    return
  }

  SVGViewbox = extractSVGViewbox(SVGContent)
  SVGPath = SVGPathExtractor.parse(optimizedSVG.data)
  myrtille = `+myrtille('YOUR-DOMAIN-HERE', '${SVGViewbox}', "${SVGPath}")`

  displayMyrtille()
}

/**
 * Extract viewbox values fron a SVG
 * @param {string} optimizedSVGString the SVG content
 * @returns {string} string of viewbox values
 */
function extractSVGViewbox(optimizedSVGString) {
  const viewBoxRegex = /<svg .*?viewBox=["'](-?[\d.]+[, ]+-?(?:[\d.]+[, ]){2}[\d.]+)["']/
  const matches = optimizedSVGString.match(viewBoxRegex)

  if (matches && matches.length >= 2) {
    return matches[1]
  }

  warningContainer.className = 'upload-warning displayed'
  warningText.innerHTML = 'no viewbox found in SVG'
}

/**
 * Manipulate DOM to display myrtille result
 */
function displayMyrtille() {
  uploadContainer.style.display = 'none'
  myrtilleContainer.style.display = 'flex'
  myrtilleString.innerHTML = myrtille
  goButton.style.display = 'none'
  copyButton.style.display = 'block'
}

/**
 * Copy myrtille to clipboard & transform copy button text
 */
function copyToClipBoard() {
  if (myrtille) {
    const element = document.createElement('textarea')
    document.body.append(element)
    element.value = myrtille
    element.select()
    document.execCommand('copy')
    element.remove()
    copyButton.innerHTML = 'copied!'
    copyButton.style.fontStyle = 'italic'
  }
}

// /////////////// //
// EVENT LISTENERS //
// /////////////// //
uploadInput.addEventListener('change', addFilesFromBrowse)
uploadArea.addEventListener('drop', addFilesFromDrop)
uploadArea.addEventListener('dragover', dragFileOver)
uploadArea.addEventListener('dragleave', dragFileOutside)
resetButton.addEventListener('click', resetPage)
goButton.addEventListener('click', generateMyrtille)
copyButton.addEventListener('click', copyToClipBoard)

