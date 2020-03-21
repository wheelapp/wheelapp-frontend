
  renderPhotoUploadCaptchaToolbar() {
    return (
      <PhotoUploadCaptchaToolbar
        ref={photoUploadCaptchaToolbar =>
          (this.photoUploadCaptchaToolbar = photoUploadCaptchaToolbar)
        }
        hidden={!this.props.isPhotoUploadCaptchaToolbarVisible}
        onClose={this.props.onAbortPhotoUploadFlow}
        onCompleted={this.props.onFinishPhotoUploadFlow}
        photosMarkedForUpload={this.props.photosMarkedForUpload}
        waitingForPhotoUpload={this.props.waitingForPhotoUpload}
        photoCaptchaFailed={this.props.photoCaptchaFailed}
        appToken={this.props.app.tokenString}
      />
    );
  }
