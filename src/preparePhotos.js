const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })

function listFiles (dir) {
  const dirents = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true })
  return dirents.filter(dirent => dirent.isFile())
}

function autoRotateResizeAndConvertToJpeg (file, outputFileName) {
  return new Promise((resolve, reject) => {
    gm(file)
      .command('convert')
      .autoOrient()
      .in('-resize')
      .in('720x480>')
      .in('-transparent')
      .in('white')
      .in('-extent')
      .in('0x0')
      .write(`${outputFileName}.jpeg`, err => {
        if (err) {
          reject(err)
        } else {
          console.log(`> Prepared photo: ${file}`)
          resolve()
        }
      })
  })
}

async function preparePhotos (inputDir, outputDir) {
  const timelineDir = `${outputDir}/timeline`

  const files = listFiles(inputDir)
  const editedFiles = []

  for (let i = 0; i < files.length; i++) {
    const stat = fs.statSync(`${inputDir}/${files[i].name}`)
    const date = stat.mtime

    const dir = `${timelineDir}/${date.getFullYear()}/${date.getMonth() + 1}`

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    await autoRotateResizeAndConvertToJpeg(
      `${inputDir}/${files[i].name}`,
      `${dir}/${date.valueOf()}`
    )

    editedFiles.push(`${dir}/${date.valueOf()}.jpeg`)
  }

  return editedFiles
}

module.exports = preparePhotos
