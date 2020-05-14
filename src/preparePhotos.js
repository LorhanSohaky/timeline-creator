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
      .in('-background')
      .in('white')
      .in('-flatten')
      .in('-resize')
      .in('1920x1080>')
      .autoOrient()
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
  const files = listFiles(inputDir)

  for (let i = 0; i < files.length; i++) {
    const stat = fs.statSync(`${inputDir}/${files[i].name}`)
    const date = stat.mtime

    const dir = `${outputDir}/${date.getFullYear()}/${date.getMonth() + 1}`

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    await autoRotateResizeAndConvertToJpeg(
      `${inputDir}/${files[i].name}`,
      `${dir}/${date.valueOf()}`
    )
  }

  return files
}

module.exports = preparePhotos
