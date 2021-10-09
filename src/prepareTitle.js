const fs = require('fs')
const gm = require('gm').subClass({ imageMagick: true })
const moment = require('moment')

moment.locale('pt-br')

async function prepareTitle (dir, mainTitle) {
  const convertedDir = `${dir}/converted`

  const struct = getStructRecursively(convertedDir)

  await createTitle(struct[0], mainTitle)
  for (let i = 1; i < struct.length; i++) {
    const paths = struct[i].split('/')
    const last = paths[paths.length - 1]
    const penultimate = paths[paths.length - 2]

    const isMonth = !isNaN(last) && !isNaN(penultimate)

    const title = isMonth ? moment(`${last}`, 'M').format('MMMM') : last

    await createTitle(struct[i], title)
  }
}

function getStructRecursively (dir) {
  const dirents = fs.readdirSync(dir, {
    encoding: 'utf8',
    withFileTypes: true
  })

  const list = [dir]

  dirents
    .filter(dirent => dirent.isDirectory() && !isNaN(dirent.name))
    .forEach(dirent =>
      list.push(getStructRecursively(`${dir}/${dirent.name}`))
    )

  return list.flat()
}

async function createTitle (dir, title) {
  const width = 720
  const height = 480

  return new Promise((resolve, reject) => {
    const outputFile = `${dir}/title.png`

    const templateSettings = {
      gravity: 'center'
    }
    gm()
      .in('-size', `${width}x${height}`)
      .in('-gravity', templateSettings.gravity)
      .in('-background', 'transparent')
      .in('-fill', 'white')
      .in('-kerning', '-1')
      .in(`caption:${title}`)
      .write(outputFile, error => {
        if (error) {
          return reject(error)
        }
        console.log(`> Created title: ${outputFile}`)
        resolve(outputFile)
      })
  })
}

module.exports = prepareTitle
