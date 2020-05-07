/* eslint-disable complexity */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import { getAWSVideoUrl } from '../constants/urls';
import Error from './Error';
import ReviewDuette from './ReviewDuette';

const RecordDuetteModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const {
    setShowRecordDuetteModal,
    bluetooth,
  } = props;

  const [recording, setRecording] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [duetteUri, setDuetteUri] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  const [vidRef, setVidRef] = useState(null);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [error, setError] = useState(false);

  const record = async () => {
    try {
      const vid = await cameraRef.recordAsync();
      setDuetteUri(vid.uri);
      setShowPreviewModal(true);
    } catch (e) {
      console.log('error starting recording: ', e);
      setError(true);
    }
  };

  const play = async () => {
    try {
      await vidRef.playFromPositionAsync(0, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
    } catch (e) {
      console.log('error playing video: ', e);
      setError(true);
    }
  };

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      cameraRef.stopRecording();
    } else {
      setRecording(true);
      record();
      play();
    }
  };

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  };

  const handleCancel = async () => {
    try {
      await vidRef.unloadAsync();
      cameraRef.stopRecording();
      setShowRecordDuetteModal(false);
    } catch (e) {
      console.log('error unloading video: ', e);
    }
  };

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (updateObj.isBuffering === vidDoneBuffering) setVidDoneBuffering(!updateObj.isBuffering);
  };

  const handleError = () => {
    setRecording(false);
    setShowPreviewModal(false);
  };

  return (
    error ? (
      <Error handleGoBack={handleError} />
    ) : (
        <View style={styles.container}>
          {
            showPreviewModal ? (
              <ReviewDuette
                bluetooth={bluetooth}
                setShowRecordDuetteModal={setShowRecordDuetteModal}
                duetteUri={duetteUri}
                setShowPreviewModal={setShowPreviewModal}
              />
            ) : (
                <Modal
                  onRequestClose={handleCancel}
                  supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
                  onOrientationChange={e => handleModalOrientationChange(e)}
                >
                  <View style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'black',
                    paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                    height: '100%'
                  }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Video
                        ref={ref => setVidRef(ref)}
                        source={{ uri: getAWSVideoUrl(props.selectedVideo.id) }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="cover"
                        progressUpdateIntervalMillis={50}
                        onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
                        style={{
                          width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                          height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                        }}
                      />
                      {/* TODO: add codec to camera input? (e.g. .mov) */}
                      <Camera
                        style={{
                          width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                          height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                        }}
                        type={Camera.Constants.Type.front}
                        ref={ref => setCameraRef(ref)}>
                        <View>
                          <TouchableOpacity
                            onPress={!recording ? handleCancel : () => { }}
                          >
                            <Text style={{
                              ...styles.overlayText,
                              fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 22,
                            }}
                            >
                              {recording ? 'Recording' : 'Cancel'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        {
                          vidLoaded && vidDoneBuffering &&
                          <View
                            style={styles.recordButtonContainer}>
                            <TouchableOpacity
                              onPress={toggleRecord}
                              style={{
                                ...styles.recordButton,
                                borderWidth: screenWidth / 100,
                                width: screenWidth / 10,
                                height: screenWidth / 10,
                                backgroundColor: recording ? 'black' : 'red',
                              }}
                            />
                          </View>
                        }
                        {
                          screenOrientation === 'LANDSCAPE' &&
                          <TouchableOpacity
                            onPress={handleCancel}
                            style={styles.problemContainerPortrait}
                          >
                            <Text style={{ color: 'red' }}>Having a problem? Touch here to try again.</Text>
                          </TouchableOpacity>
                        }
                      </Camera>
                    </View>
                    {
                      screenOrientation === 'PORTRAIT' &&
                      <TouchableOpacity
                        onPress={handleCancel}
                      >
                        <Text style={{ color: 'red', marginTop: 20 }}>Having a problem? Touch here to try again.</Text>
                      </TouchableOpacity>
                    }
                  </View>
                </Modal >
              )
          }
        </View >
      )
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  },
  overlayText: {
    paddingLeft: 20,
    paddingTop: 20,
    fontWeight: 'normal',
    color: 'red',
  },
  problemContainerPortrait: {
    alignItems: 'center',
    paddingBottom: 10,
    height: 30,
  },
  recordButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  recordButton: {
    borderColor: 'darkred',
    alignSelf: 'flex-end',
    borderRadius: 50,
    margin: 10,
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteModal);
