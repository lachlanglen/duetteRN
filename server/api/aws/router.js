const router = require('express').Router();
const { s3 } = require('../../../awsconfig')
const bucketName = process.env.AWS_BUCKET_NAME;

router.post('/', (req, res, next) => {
  console.log('in POST!')
  // console.log('req.body: ', req.body)
  const { Key, Body } = req.body;
  s3.putObject({ Bucket: bucketName, Key, Body }, (err, data) => {
    if (err) {
      console.log('error: ', err)
      res.status(400).send(err)
    } else {
      console.log('success! data: ', data)
      res.status(200).send(data)
    }
  })
})

router.get('/:Key', (req, res, next) => {
  console.log('in AWS GET')
  const { Key } = req.params;
  // console.log('Key: ', Key)
  s3.getObject({ Bucket: bucketName, Key }, (error, data) => {
    if (error) {
      console.log('error getting object from AWS: ', error)
      return res.status(400).send(error)
    }
    // const objectData = data.Body.toString('base64');
    res.status(200).send(data.Body)
    // console.log('path: ', RNFS.DocumentDirectoryPath)
    // const path = `file://${RNFS.DocumentDirectoryPath}/${Key}.mp4`;
    // RNFS.writeFile(path, objectData, 'base64')
    //   .then(() => {
    //     console.log('FILE WRITTEN!');
    //     res.status(200).send('success getting data from AWS & creating file!')
    //   })
    //   .catch((err) => {
    //     console.log('error: ', err.message);
    //     res.status(400).send('error writing mp4 file: ', err.message)
    //   });
  })
})

module.exports = router;