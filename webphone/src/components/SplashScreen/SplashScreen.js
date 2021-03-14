import { connect } from "react-redux";
import { object, func } from "prop-types";
import css from "./SplashScreen.scss";
import gcss from "../App/App.scss";

export const DISCONNECTED = "DISCONNECTED";
export const LOADING = "LOADING";
export const AUTH_ERROR = "AUTH_ERROR";

class SplashScreen extends React.Component {
  reconnect = () => {
    window.location.reload();
  };

  render() {
    const { status } = this.props.splashScreen;
    let content;

    switch (status) {
      case DISCONNECTED: {
        content = (
          <div className={css.splashContent}>
            <div className={css.text}>Disconnected</div>
            <button className={css.blackBtn} onClick={this.reconnect}>
              RECONNECT
            </button>
          </div>
        );
        break;
      }
      case AUTH_ERROR: {
        content = (
          <div className={css.splashContent}>
            <div className={css.text}>
              Your username or the password are not the right ones. Please check
              them.
            </div>
            <button className={css.blackBtn} onClick={window.close}>
              Close
            </button>
          </div>
        );
        break;
      }
      case LOADING: {
        content = (
          <div className={gcss.spinner}>
            <div className={gcss.bounce1}></div>
            <div className={gcss.bounce2}></div>
            <div className={gcss.bounce3}></div>
          </div>
        );
      }
      default:
        content = (
          <div className={gcss.spinner}>
            <div className={gcss.bounce1}></div>
            <div className={gcss.bounce2}></div>
            <div className={gcss.bounce3}></div>
          </div>
        );
    }

    return <div className={css.splashBox}>{content}</div>;
  }
}

SplashScreen.propTypes = {
  currentUser: object.isRequired,
  socketInit: func.isRequired,
  splashScreen: object.isRequired,
};

const mapStateToProps = (state) => ({
  currentUser: state.currentUser,
  splashScreen: state.splashScreen,
});

export default connect(mapStateToProps)(SplashScreen);
