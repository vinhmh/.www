import css from "./NavBarIBP.scss";
import gcss from "../App/App.scss";
import React from "react";

export default class NavbarIBP extends React.Component {
  constructor(props) {
    super(props);

    this.navMenuRef = React.createRef();
  }

  toggleMenu() {
    if (this.navMenuRef.current.style.display === "block")
      this.navMenuRef.current.style.display = "none";
    else this.navMenuRef.current.style.display = "block";
  }

  render() {
    const { userName, onJoinMeetingParams, conferenceName } = this.props;
    return (
      <div className={css.navBarIBP}>
        <div className={css.menuContainer} ref={this.navMenuRef}>
          <div className={css.menuIBP}>
            <div className={css.menuIBPContainer}>
              <button
                type="button"
                className={'btn ' + css.menuBtn + ' ' + gcss.noOutline}
                onClick={() => this.toggleMenu()}
              >
                <img
                  src="assets/images/bouton_menu_on.png"
                  alt="logo"
                  width="30"
                  height="30"
                />
              </button>
              <img
                src="assets/images/logo_ibp.png"
                alt="logo"
                className={css.menuLogo}
                width="38"
                height="38"
              />
              <div className={css.availableConferences + ' my-5'}>
                <p className={css.menuUserName}>{userName}</p>
                <p className={css.conferenceName}>{conferenceName}</p>
              </div>
              <div className={css.ibpMenuDropdown + " d-block"}>
                <button
                  type="button"
                  className={gcss.ibpBtn + ' ' + gcss.ibpBtnSelect + ' ' + gcss.noOutline + ' d-block pt-3 px-3 ml-auto mr-auto'}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  Italiano
                  <img
                    className={css.arrowIcon}
                    src="assets/images/icon_fleche_filtre.png"
                    alt="select icon"
                  />
                </button>

                <div className={css.ibpMenuDropdownContent}>
                  <div className={css.ibpMenuDropdownBtns}>
                    <button
                      className={css.ibpMenuBtn + ' ' + gcss.noOutline}
                      type="button"
                    >
                      French
                    </button>
                    <button
                      className={css.ibpMenuBtn + ' ' + gcss.noOutline}
                      type="button"
                    >
                      English
                    </button>
                    <button
                      className={css.ibpMenuBtn + ' ' + gcss.noOutline}
                      type="button"
                    >
                      Spanish
                    </button>
                  </div>
                </div>
              </div>
              <div className={css.menuBtns}>
                <div className={css.menuBtnsContainer}>
                  <button className={gcss.noOutline + ' btn'} type="button" onClick={() => {this.toggleMenu(); onJoinMeetingParams(); }}>
                    <img
                      className={css.settingsIcon}
                      src="assets/images/bouton_parametre_off.png"
                      alt="settings icon"
                      width="35"
                      height="35"
                    />
                    <span className={css.settingsText + ' d-block'}>Settings</span>
                  </button>
                  <button className={gcss.noOutline + ' btn'} type="button">
                    <img
                      className={css.demoIcon}
                      src="assets/images/bouton_demo_off.png"
                      alt="demo icon"
                      width="35"
                      height="35"
                    />
                    <span className={css.settingsText + ' d-block'}>Demo</span>
                  </button>
                  <button className={gcss.noOutline + ' btn'} type="button">
                    <img
                      className={css.presentationIcon}
                      src="assets/images/bouton_presentation_off.png"
                      alt="presentation icon"
                      width="35"
                      height="35"
                    />
                    <span className={css.settingsText + ' d-block'}>Presentation</span>
                  </button>
                </div>
                <div className={css.logoutBtnContainer}>
                  <button className={css.logoutBtn + ' ' + gcss.noOutline + ' btn'} type="button">
                    <img
                      className={css.logoutIcon}
                      src="assets/images/bouton_deconnexion.png"
                      alt="logout icon"
                      width="35"
                      height="35"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
