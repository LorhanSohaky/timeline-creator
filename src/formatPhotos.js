const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })

async function formatPhotos (dir) {
  const timelineDir = `${dir}/timeline`

  const struct = getStructRecursively(timelineDir)
  createDirectories(struct, dir)

  const files = listFilesRecursivelyAndStruct(timelineDir)

  const convertedPhotos = await prepareAllPhotos(files, dir)

  return convertedPhotos
}

function getStructRecursively (dir) {
  const dirents = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true })

  const paths = dirents
    .filter(dirent => dirent.isDirectory() && !isNaN(dirent.name))
    .map(dirent => getStructRecursively(`${dir}/${dirent.name}`))

  if (paths.length > 0) {
    return paths.flat()
  } else {
    return dir
  }
}

function createDirectories (directories, mainDir) {
  for (let i = 0; i < directories.length; i++) {
    const dir = directories[i].replace(
      `${mainDir}/timeline`,
      `${mainDir}/converted`
    )

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

function listFilesRecursivelyAndStruct (dir) {
  const dirents = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true })
  const files = dirents
    .filter(dirent => dirent.isFile())
    .map(dirent => `${dir}/${dirent.name}`)
  const directories = dirents
    .filter(dirent => dirent.isDirectory() && !isNaN(dirent.name))
    .map(dirent =>
      listFilesRecursivelyAndStruct(`${dir}/${dirent.name}`).flat()
    )

  return [...files, ...directories].flat()
}

async function prepareAllPhotos (photos, mainDir) {
  const outputFiles = []
  for (let i = 0; i < photos.length; i++) {
    const outputFileName = photos[i].replace(
      `${mainDir}/timeline`,
      `${mainDir}/converted`
    )
    outputFiles.push(await preparePhoto(photos[i], outputFileName))
  }

  return outputFiles
}

function preparePhoto (inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const width = 1920
    const height = 1080

    gm()
      .in(inputFile)
      .out('(')
      .out('-clone')
      .out('0')
      .out('-background', 'white')
      .out('-blur', '0x9')
      .out('-resize', `${width}x${height}^`)
      .out(')')
      .out('(')
      .out('-clone')
      .out('0')
      .out('-background', 'white')
      .out('-resize', `${width}x${height}`)
      .out(')')
      .out('-delete', '0')
      .out('-gravity', 'center')
      .out('-compose', 'over')
      .out('-composite')
      .out('-extent', `${width}x${height}`)
      .write(outputFile, error => {
        if (error) {
          return reject(error)
        }

        console.log(`> Photo converted: ${inputFile}`)
        resolve(outputFile)
      })
  })
}

module.exports = formatPhotos
