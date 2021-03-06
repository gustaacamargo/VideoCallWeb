import ConnectyCube from 'connectycube';
import { Component } from "react";
const iOS = navigator.platform === "iOS";
const isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test((navigator.userAgent || navigator.vendor || window.opera)) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent || navigator.vendor || window.opera).substr(0, 4))
export default class CallService extends Component{
  constructor(props) {
    super(props)
    this.state = {
      _session: null,
      mediaDevicesIds: [],
      activeDeviceId: null,
      isAudioMuted: false,
      isSharingScreen: false,
      startEventSharinScreen: null
    }
  }

  mediaParams = {
    audio: true,
    video: true,
    elementId: "localStream",
    options: {
      muted: true,
      mirror: true,
    },
  };

  sharingScreenMediaParams = { 
    audio: true,
    video: { frameRate: { ideal: 10, max: 15 } },
    elementId: "localStream",
    options: {
      muted: true,
      mirror: false
    }
  };

  onCallListener = (session, extension) => {
    return new Promise((resolve, reject) => {
      if (session.initiatorID === session.currentUserID) {
        reject();
      }

      if (this.state._session) {
        this.rejectCall(session, { busy: true });
        reject();
      }
      this.state._session = session;
      resolve();
    });
  };

  onAcceptCallListener = (session, userId, extension) => {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this.state._session = null;
        this.showSnackbar("Ligação aceita");
        reject();
      } else {
        this.showSnackbar("Ligação aceita");
        resolve();
      }
    });
  };

  onRejectCallListener = (session, userId, extension = {}) => {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this.state._session = null;
        this.showSnackbar('You have rejected the call on other side');

        reject();
      } else {
        const message = extension.busy
          ? `Esta pessoa está ocupada`
          : `Esta pessoa rejeitou a chamada`;

        this.showSnackbar(message);

        resolve();
      }
    });
  };

  onStopCallListener = (session, userId, extension) => {
    return new Promise((resolve, reject) => {
      if (!this.state._session) {
        reject();
      }
      const isStoppedByInitiator = session.initiatorID === userId;    
      this.showSnackbar("Ligação perdida");

      if (isStoppedByInitiator) {
        this.stopCall();
      } else {
        this.stopCall(userId);
      }
      resolve();
      
    });
  };

  onUserNotAnswerListener = (session, userId) => {
    return new Promise((resolve, reject) => {
      if (!this.state._session) {
        reject();
      } else {
        this.showSnackbar("Ligação não atendida");
        this.stopCall(userId);

        resolve();
      }
    });

    
  };

  onRemoteStreamListener = (session, userId, stream) => {
    return new Promise((resolve, reject) => {
      if (!this.state._session) {
        reject();
      }    
      const remoteStreamSelector = `remoteStream-${userId}`;
      //document.getElementById(`videochat-stream-loader-${userId}`).remove();
      this.state._session.attachMediaStream(remoteStreamSelector, stream);
      resolve()
      //this.onDevicesChangeListener();
      //this._prepareVideoElement(remoteStreamSelector);
    });
   
  };

  acceptCall = () => {
    const extension = {};
    const { opponentsIDs, initiatorID, currentUserID } = this.state._session;
    const opponentsIds = [initiatorID, ...opponentsIDs]
    this.state._session.getUserMedia(this.mediaParams, (error, localStream) => {
      if(localStream && !error) {
        this.state._session.accept(extension);
        this.setActiveDeviceId(localStream);
      }
    })
  };

  rejectCall = (extension = {}) => {
    this.state._session.reject(extension);
    this.state._session = null;
  };

  startCall = async (opponents, opponentsIds, setterVideoScreen) => {
    const options = {};
    const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible
    //this.onDevicesChangeListener();

    if (opponents.length > 0) {
      // this.$dialing.play();
      this.state._session = await ConnectyCube.videochat.createNewSession(opponentsIds, type, options);
      await this.state._session.getUserMedia(this.mediaParams, (error, stream) => {
        if(stream && !error) {
          this.state._session.call({});
          this.setActiveDeviceId(stream);
          setterVideoScreen()
        }
      })
    } else {
      this.showSnackbar("Select at less one user to start Videocall");
    }
  };

  stopCall = () => {
    if (this.state._session) {
      this.state._session.stop({});
      ConnectyCube.videochat.clearSession(this.state._session.ID);
      this.state._session = null;
      this.state.mediaDevicesIds = [];
      this.state.activeDeviceId = null;
      this.state.isAudioMuted = false;

      if(this.state.isSharingScreen){
        this.state.isSharingScreen = false
        //this.updateSharingScreenBtn()
      }

      // if (iOS) {
      //   $videochatScreen.style.background = "#000000";
      // }
    }
  };

  setMediaDevices() {
    return ConnectyCube.videochat.getMediaDevices().then(mediaDevices => {
      this.state.mediaDevicesIds = mediaDevices.map(({ deviceId }) => deviceId);
    });
  }

  onDevicesChangeListener = () => {
    if (iOS) return false;
    ConnectyCube.videochat.getMediaDevices("videoinput").then(mediaDevices => {
      this.state.mediaDevicesIds = mediaDevices.map(({ deviceId }) => deviceId);

      if (this.state.mediaDevicesIds.length < 2) {
        //this.$switchCameraButton.disabled = true;
        return true
        // if (this.state.mediaDevicesIds[0] !== this.state.activeDeviceId && !this.state.isSharingScreen) {
        //   //this.switchCamera();
        //   console.log('b');
        // }
      } else {
        return false
        //this.$switchCameraButton.disabled = false;
      }
    });
  };

  setActiveDeviceId = stream => {
    if (stream ) {
      const videoTracks = stream.getVideoTracks();
      const videoTrackSettings = videoTracks[0].getSettings();

      this.state.activeDeviceId = videoTrackSettings.deviceId;
    }
  };

  setAudioMute = () => {
    if (this.state.isAudioMuted) {
      this.state._session.unmute("audio");
      this.state.isAudioMuted = false;
      return "remove"
    } else {
      this.state._session.mute("audio");
      this.state.isAudioMuted = true;
      return "add"
    }
  };

  switchCamera = () => {
    const mediaDevicesId = this.state.mediaDevicesIds.find(deviceId => deviceId !== this.state.activeDeviceId);
    this.state._session.switchMediaTracks({ video: mediaDevicesId }, (error, stream) => {
      if(!error && stream) {
        this.state.activeDeviceId = mediaDevicesId;

        if (this.state.isAudioMuted) {
          this.state._session.mute("audio");
        }
      }
    });
  };

  updateStream = (stream) => {
    this.setActiveDeviceId(stream);
    this._prepareVideoElement("localStream");
  }

  /* SNACKBAR */

  showSnackbar = infoText => {
    const $snackbar = document.getElementById("snackbar");

    $snackbar.innerHTML = infoText;
    $snackbar.classList.add("show");

    setTimeout(function() {
      $snackbar.innerHTML = "";
      $snackbar.classList.remove("show");
    }, 3000);
  };

  _prepareVideoElement = videoElement => {
    const $video = document.getElementById(videoElement);

    $video.style.visibility = "visible";

    // if (iOS) {
    //   document.getElementById("videochat").style.background = "transparent";
    //   $video.style.backgroundColor = "";
    //   $video.style.zIndex = -1;
    // }
  };
}