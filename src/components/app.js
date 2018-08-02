import React from 'react';
import {connect} from 'react-redux';
import {Route, withRouter} from 'react-router-dom';

import HeaderBar from './header-bar';
import LandingPage from './landing-page';
import Dashboard from './dashboard';
import RegistrationPage from './registration-page';
import {refreshAuthToken, clearAuth, authWarn} from '../actions/auth';

export class App extends React.Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.loggedIn && this.props.loggedIn) {
      // When we are logged in, refresh the auth token periodically
      this.startPeriodicRefresh();
      setTimeout(() => {
        this.props.dispatch(authWarn());
      }, 3000);
      this.autoLogout = setTimeout(() => {
        this.props.dispatch(clearAuth());
      }, 6000);
    } else if (prevProps.loggedIn && !this.props.loggedIn) {
      // Stop refreshing when we log out
      this.stopPeriodicRefresh();
    } 
  }

  componentWillUnmount() {
    this.stopPeriodicRefresh();
  }

  stayLoggedIn(){
    clearTimeout(this.autoLogout);
  }

  startPeriodicRefresh() {
    this.refreshInterval = setInterval(
      () => this.props.dispatch(refreshAuthToken()),
      // 10 * 60 * 1000 // 10 min
      60000 // 1 min
    );
  }

  stopPeriodicRefresh() {
    if (!this.refreshInterval) {
      return;
    }

    clearInterval(this.refreshInterval);
  }

  warning(){
    if(this.props.warning){
      return (
        <div>
          <h1>You are going to be logged out</h1>
          <button onClick={() => this.stayLoggedIn()}>Stay logged in </button>
        </div>);
    }
  }

  render() {
    return (
      <div className="app" >
        <HeaderBar />
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/register" component={RegistrationPage}/>
        {this.warning()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  warning: state.auth.warning,
  authToken: state.auth.authToken,
  hasAuthToken: state.auth.authToken !== null,
  loggedIn: state.auth.currentUser !== null
});

// Deal with update blocking - https://reacttraining.com/react-router/web/guides/dealing-with-update-blocking
export default withRouter(connect(mapStateToProps)(App));
