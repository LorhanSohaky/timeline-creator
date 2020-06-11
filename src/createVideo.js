const fs = require('fs')
const concat = require('ffmpeg-concat')
const videoshow = require('videoshow')

const videoOptions = {
  fps: 25,
  loop: 2, // seconds
  transition: true,
  transitionDuration: 1, // seconds
  videoBitrate: 1024,
  videoCodec: 'libx264',
  size: '720x480',
  audioBitrate: '128k',
  audioChannels: 2,
  format: 'mp4',
  pixelFormat: 'yuv420p'
}

const transitions = {
  year: {
    name: 'fade',
    duration: 1000
  },
  month: {
    name: 'crosszoom',
    duration: 1000
  },
  main: {
    name: 'directionalwarp',
    duration: 1000
  }
}

async function createVideo (dir) {
  const videoDir = `${dir}/video`
  const convertedDir = `${dir}/converted`
  const videos = []

  prepareDirectory(videoDir)

  const years = getYears(convertedDir)

  const main = await createMainVideo(convertedDir, videoDir)
  videos.push(main)

  for (let i = 0; i < years.length; i++) {
    const video = await createYearVideo(years[i], videoDir)
    videos.push(video)
  }

  await concat({
    output: `${videoDir}/final.mp4`,
    videos,
    transition: transitions.main
  })

  return null
}

function prepareDirectory (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getYears (dir) {
  const dirents = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true })

  const years = dirents
    .filter(dirent => dirent.isDirectory() && !isNaN(dirent.name))
    .map(dirent => `${dir}/${dirent.name}`)

  return years
}

function createMainVideo (dir, outputDir) {
  return new Promise((resolve, reject) => {
    videoshow([`${dir}/title.png`], videoOptions)
      .save(`${outputDir}/title.mp4`)
      .on('error', function (err, stdout, stderr) {
        console.error('Error:', err)
        console.error('ffmpeg stderr:', stderr)
        reject(err)
      })
      .on('end', function (output) {
        console.log('> Video created in:', output)
        resolve(output)
      })
  })
}

function createYearVideo (dir, outputDir) {
  const paths = dir.split('/')
  const year = paths[paths.length - 1]

  const files = listFilesRecursively(dir)

  return new Promise((resolve, reject) => {
    videoshow(files, videoOptions)
      .save(`${outputDir}/${year}.mp4`)
      .on('error', function (err, stdout, stderr) {
        console.error('Error:', err)
        console.error('ffmpeg stderr:', stderr)
        reject(err)
      })
      .on('end', function (output) {
        console.log('> Video created in:', output)
        resolve(output)
      })
  })
}

function listFilesRecursively (dir) {
  const dirents = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true })
  const files = dirents
    .filter(dirent => dirent.isFile())
    .sort((a, b) => {
      const aName = a.name.replace(/\.[^.]*$/, '')
      const bName = b.name.replace(/\.[^.]*$/, '')
      if (aName === 'title') {
        return -1
      } else if (bName === 'title') {
        return 1
      } else {
        return aName.localeCompare(bName)
      }
    })
    .map(dirent => `${dir}/${dirent.name}`)

  const otherFiles = dirents
    .filter(dirent => dirent.isDirectory() && !isNaN(dirent.name))
    .map(dirent => listFilesRecursively(`${dir}/${dirent.name}`).flat())

  return [...files, ...otherFiles].flat()
}

module.exports = createVideo
