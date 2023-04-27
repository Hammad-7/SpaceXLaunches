//Launch Table types
export type Rocket = {
    rocket_name: string;
    rocket_type: string;
  };
  
export  type Launch = {
    id: string;
    mission_name: string;
    rocket: Rocket;
    launch_date_local: string;
    launch_success: boolean;
    favourite: boolean;
  };
  
export  type LaunchesData = {
    launchesPast: Launch[];
    launchesUpcoming: Launch[];
  };
  
export type LaunchesVars = {
    limit: number;
  };
  
export type queryProp = {
    query: 'future' | 'past'
  }


//Single Launch details type
export type LaunchDetailsProps = {
    launchId: string;
    visible: boolean;
    onCancel: () => void;
  };
  
export type LaunchDetailsData = {
    launch: {
      mission_name: string;
      rocket: {
        rocket_name: string;
        rocket_type: string;
      };
      launch_date_local: string;
      launch_success: boolean;
      details: string;
    };
  };
  
export type LaunchDetailsVars = {
    id: string;
  };