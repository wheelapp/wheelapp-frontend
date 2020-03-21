
  renderPhotoUploadInstructionsToolbar() {
    return (
      <PhotoUploadInstructionsToolbar
        ref={photoUploadInstructionsToolbar =>
          (this.photoUploadInstructionsToolbar = photoUploadInstructionsToolbar)
        }
        hidden={!this.props.isPhotoUploadInstructionsToolbarVisible}
        waitingForPhotoUpload={this.props.waitingForPhotoUpload}
        onClose={this.props.onAbortPhotoUploadFlow}
        onCompleted={this.props.onContinuePhotoUploadFlow}
        inEmbedMode={this.props.inEmbedMode}
      />
    );
  }
  
 // photo feature
 isPhotoUploadCaptchaToolbarVisible: boolean,
 isPhotoUploadInstructionsToolbarVisible: boolean,
 onStartPhotoUploadFlow: () => void,
 onAbortPhotoUploadFlow: () => void,
 onContinuePhotoUploadFlow: (photos: FileList) => void,
 onFinishPhotoUploadFlow: (photos: FileList, captchaSolution: string) => void,
 onStartReportPhotoFlow: (photo: PhotoModel) => void,
 onFinishReportPhotoFlow: (photo: PhotoModel, reason: string) => void,
 photosMarkedForUpload: FileList | null,
 waitingForPhotoUpload?: boolean,
 photoCaptchaFailed?: boolean,
 photoFlowNotification?: 'uploadProgress' | 'uploadFailed' | 'reported' | 'waitingForReview',
 photoFlowErrorMessage: string | null,
 photoMarkedForReport: PhotoModel | null,

onStartPhotoUploadFlow = () => {
  // start requesting captcha early
  accessibilityCloudImageCache.getCaptcha(this.props.app.tokenString);

  this.setState({
    isSearchBarVisible: false,
    waitingForPhotoUpload: false,
    isPhotoUploadInstructionsToolbarVisible: true,
    photosMarkedForUpload: null,
    photoFlowErrorMessage: null,
  });
};

onExitPhotoUploadFlow = (
  notification: string = null,
  photoFlowErrorMessage: string | null = null
) => {
  this.setState({
    photoFlowErrorMessage,
    isSearchBarVisible: !isOnSmallViewport(),
    waitingForPhotoUpload: false,
    isPhotoUploadInstructionsToolbarVisible: false,
    isPhotoUploadCaptchaToolbarVisible: false,
    photosMarkedForUpload: null,
    photoCaptchaFailed: false,
    photoFlowNotification: notification,
  });
};

onContinuePhotoUploadFlow = (photos: FileList) => {
  if (photos.length === 0) {
    this.onExitPhotoUploadFlow();
    return;
  }
  if (accessibilityCloudImageCache.hasSolvedCaptcha()) {
    this.onFinishPhotoUploadFlow(photos, accessibilityCloudImageCache.captchaSolution || '');
  } else {
    this.setState({
      isSearchBarVisible: false,
      isPhotoUploadInstructionsToolbarVisible: false,
      isPhotoUploadCaptchaToolbarVisible: true,
      photosMarkedForUpload: photos,
      photoCaptchaFailed: false,
      photoFlowNotification: undefined,
      photoFlowErrorMessage: null,
    });
  }
};

onFinishPhotoUploadFlow = (photos: FileList, captchaSolution: string) => {
  console.log('onFinishPhotoUploadFlow');
  const { featureId } = this.props;

  if (!featureId) {
    console.error('No feature found, aborting upload!');
    this.onExitPhotoUploadFlow();
    return;
  }

  this.setState({ waitingForPhotoUpload: true, photoFlowNotification: 'uploadProgress' });

  accessibilityCloudImageCache
    .uploadPhotoForFeature(String(featureId), photos, this.props.app.tokenString, captchaSolution)
    .then(() => {
      console.log('Succeeded upload');
      this.onExitPhotoUploadFlow('waitingForReview');
    })
    .catch(reason => {
      console.error('Failed upload', reason);
      if (reason.message === InvalidCaptchaReason) {
        this.setState({ waitingForPhotoUpload: false, photoCaptchaFailed: true });
      } else {
        this.onExitPhotoUploadFlow('uploadFailed', reason && reason.message);
      }
    });
};

onStartReportPhotoFlow = (photo: PhotoModel) => {
  this.setState({ isSearchBarVisible: false, photoMarkedForReport: photo });
};

onFinishReportPhotoFlow = (photo: PhotoModel, reason: string) => {
  if (photo.source === 'accessibility-cloud') {
    accessibilityCloudImageCache.reportPhoto(
      String(photo.imageId),
      reason,
      this.props.app.tokenString
    );
    this.onExitReportPhotoFlow('reported');
  }
};

onExitReportPhotoFlow = (notification?: string) => {
  this.setState({
    isSearchBarVisible: !isOnSmallViewport(),
    photoMarkedForReport: null,
    photoFlowNotification: notification,
  });
};
