import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Main from './components/Main';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import axios from 'axios';
import Header from './components/Header'; // Make sure the path is correct

const App = () => {
  // const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();

  // axios.interceptors.response.use(
  //   response => response,
  //   async error => {
  //     const originalRequest = error.config;
  //     if (error.response.status === 401 && !originalRequest._retry) {
  //       originalRequest._retry = true;
  //       const token = await getAccessTokenSilently();
  //       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //       return axios(originalRequest);
  //     }
  //     return Promise.reject(error);
  //   }
  // );

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (!isAuthenticated) {
  //   return <div>You are not Authenticated!!!</div>;
  // }

  return (
    <Router>
      <Header /> 
      <Switch>
        <Route exact path="/" component={Main} />
      </Switch>
    </Router>
  );
};

export default App;