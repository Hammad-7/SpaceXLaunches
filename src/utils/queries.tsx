import { gql } from '@apollo/client';

//Get Past Launches query
export const GET_LAUNCHES = gql`
    query Launches {
      launchesPast {
        id
        mission_name
        rocket {
          rocket_name
          rocket_type
        }
        launch_date_local
        launch_success
      }
    }
  `;

//Get upcoming launches query
export const GET_UPCOMING_LAUNCHES = gql`
    query GetUpcomingLaunches {
      launchesUpcoming {
        id
        mission_name
        launch_date_local
        rocket {
          rocket_name
          rocket_type
        }
        launch_success
      }
    }
  `;

//Single Launch details query
export const GET_LAUNCH_DETAILS = gql`
  query GetLaunchDetails($id: ID!) {
    launch(id: $id) {
      mission_name
      rocket {
        rocket_name
        rocket_type
      }
      launch_date_local
      launch_success
      details
    }
  }
`;