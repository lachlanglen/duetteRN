import axios from 'axios';

const SET_VIDEOS = 'SET_VIDEOS';

export const setVideos = videos => {
  return {
    type: SET_VIDEOS,
    videos
  }

};

export const videosReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_VIDEOS:
      return action.videos;
    default:
      return state;
  }
}

export const fetchVideos = (text) => {
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/video${text ? `/?val=${text}` : ''}`)
      .then(vids => dispatch(setVideos(vids.data)))
      .catch(e => {
        throw new Error('error in setVideos thunk: ', e)
      })
  };
};

export const postVideo = (details) => {
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/video', details)
      .then(() => dispatch(fetchVideos()))
      .catch(e => {
        throw new Error('error in postVideo thunk: ', e)
      })
  };
};

export const deleteVideo = (userId, videoId, searchText) => {
  return dispatch => {
    axios.delete(`https://duette.herokuapp.com/api/video/${videoId}/${userId}`)
      .then(() => axios.delete(`https://duette.herokuapp.com/api/aws/${videoId}.mov`))
      .then(() => axios.delete(`https://duette.herokuapp.com/api/aws/${videoId}thumbnail.mov`))
      .then(() => {
        if (searchText) {
          dispatch(fetchVideos(searchText));
        } else {
          dispatch(fetchVideos());
        }
      })
      .catch(e => {
        throw new Error('error in deleteVideo thunk: ', e)
      })
  }
};


