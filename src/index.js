const prompts = require('prompts')

const preparePhotos = require('./preparePhotos')
const formatPhotos = require('./formatPhotos')
const prepareTitle = require('./prepareTitle')
const createVideo = require('./createVideo')

const questions = [
  {
    type: 'text',
    name: 'imageFolder',
    message: 'Which is the image folder path?',
    initial: 'images'
  },
  {
    type: 'text',
    name: 'outputFolder',
    message: 'Which is the output path?',
    initial: 'output'
  },
  {
    type: 'text',
    name: 'title',
    message: 'Which is the title of the video?'
  },
  {
    type: 'confirm',
    name: 'waitUser',
    message:
      'Do you want to wait for your confirmation before generating the video?',
    initial: false
  }
]

async function init () {
  const response = await prompts(questions)

  await preparePhotos(response.imageFolder, response.outputFolder)

  response.waitUser &&
    (await prompts({ type: 'confirm', message: 'Generate video?' }))

  await formatPhotos(response.outputFolder)
  await prepareTitle(response.outputFolder, response.title)
  await createVideo(response.outputFolder)
}

init()
