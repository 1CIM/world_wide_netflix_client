import React, { useState, useEffect } from 'react';
import { Card, Container, Header } from 'semantic-ui-react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

const MainPageMovieContainer = (props) => {
  const [topTenMovies, setTopTenMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState();

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  useEffect(() => {
    const fetchMovieData = async (query) => {
      try {
        if (query) {
          let headers = JSON.parse(localStorage.getItem('userData'));

          let credentials = {
            'access-token': headers.access_token,
            'token-type': headers.token_type,
            'client': headers.client,
            'expiry': headers.expiry,
            'uid': headers.uid,
          };
          await axios.get('/auth/validate_token', {headers: credentials});

          const response = await axios.get(`/movies/?query=${query}`, {
            headers: credentials,
          });
          setTopTenMovies(response.data.body);
          setErrorMessage('');
        } else {
          const pos = await getPosition();
          const { latitude, longitude } = pos.coords;
          if (latitude && longitude) {
            let headers = JSON.parse(localStorage.getItem('userData'));
            const response = await axios.get(
              `/movies/?lat=${latitude}&lon=${longitude}`,
              { headers: headers }
            );
            setTopTenMovies(response.data.body);
            setErrorMessage('');
          }
        }
      } catch (error) {
        if (error.message === 'User denied Geolocation') {
          const response = await axios.get(`/movies/`);
          setTopTenMovies(response.data.body);
          setErrorMessage(
            "Allow your location to show movies that's not from your country"
          );
        } else if (error.status === 500) {
          setErrorMessage(
            'Please try again later, our servers are currently not responding'
          );
        } else {
          setErrorMessage(error.message);
        }
      }
    };

    fetchMovieData(props.query);
    
  }, [props.update, props.query, props.message]);

  let movieList = topTenMovies.map((movie, i) => {
    return <MovieCard data-cy='movie-card' movie={movie} i={i} />;
  });

  return (
    <Container>
      {errorMessage && <Header data-cy='error-message' color='red' >{errorMessage}</Header>}
      {props.message && <Header data-cy='success-message' color='red' >{props.message}</Header>}
      <Card.Group data-cy='movie-container' itemsPerRow={5} centered>
        {movieList}
      </Card.Group>
    </Container>
  );
};

export default MainPageMovieContainer;
