import { useState, useEffect } from 'react'
import { Table, Spin, Button, Select, Space } from 'antd';
import { useQuery } from '@apollo/client';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import './components.css'
import LaunchDetails from './LaunchDetails';
import { Launch, LaunchesData, LaunchesVars, queryProp } from '../utils/types';
import { GET_LAUNCHES, GET_UPCOMING_LAUNCHES } from '../utils/queries';


const LaunchesTable = ({ query }: queryProp) => {

  //--------------------STATES-----------------------------------------//
  //state for selecting launches and displaying more information about them
  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);
  //state for setting favourite LaunchIds and retrieving it from local storage
  const [favouriteLaunchIds, setFavouriteLaunchIds] = useState<string[]>(() => {
    const savedIds = localStorage.getItem('favouriteLaunchIds');
    if (savedIds) {
      return JSON.parse(savedIds);
    }
    return [];
  });
  //state for setting favourite Past Launches and retrieving it from local storage
  const [favouritePastLaunches, setfavouritePastLaunches] = useState<Array<Launch>>(() => {
    const savedIds = localStorage.getItem('favouritePastLaunches');
    if (savedIds) {
      return JSON.parse(savedIds);
    }
    return [];
  });
  //state for setting favourite Future Launches and retrieving it from local storage
  const [favouriteFutureLaunches, setfavouriteFutureLaunches] = useState<Array<Launch>>(() => {
    const savedIds = localStorage.getItem('favouriteFutureLaunches');
    if (savedIds) {
      return JSON.parse(savedIds);
    }
    return [];
  });

  //state for filtering rockets based on the selected rocket
  const [selectedRockets, setSelectedRockets] = useState<string[]>([]);
  //state for filtering rockets based on outcomes
  const [selectedOutcomes, setSelectedOutcomes] = useState<Array<string | boolean>>([])
  //------------------------------STATES END-------------------------------------------------//



//----------------------- USEEFFECT HOOKS -------------------------------------------//
//setting favourite launch Ids on local storage
  useEffect(() => {
    localStorage.setItem('favouriteLaunchIds', JSON.stringify(favouriteLaunchIds));
  }, [favouriteLaunchIds]);

  //setting favourite past launches on local storage
  useEffect(() => {
    localStorage.setItem('favouritePastLaunches', JSON.stringify(favouritePastLaunches));
  }, [favouritePastLaunches]);

  //setting favourite past launches on local storage
  useEffect(() => {
    localStorage.setItem('favouriteFutureLaunches', JSON.stringify(favouriteFutureLaunches));
  }, [favouriteFutureLaunches]);
//-----------------------USEEFFECT HOOKS END--------------------------------------------//


//---------------COLUMNS FOR THE ANTD TABLE ---------------------------------//
  const columns = [
    {
      title: 'Mission Name',
      dataIndex: 'mission_name',
      key: 'mission_name',
      render: (text: string, record: Launch) => (
        <Button onClick={() => setSelectedLaunchId(record.id)}>{text}</Button>
      ),
    },
    {
      title: 'Rocket Name',
      dataIndex: ['rocket', 'rocket_name'],
      key: 'rocket_name',
      filterSearch: true,
    },
    {
      title: 'Rocket Type',
      dataIndex: ['rocket', 'rocket_type'],
      key: 'rocket_type',
    },
    {
      title: 'Launch Date',
      dataIndex: 'launch_date_local',
      key: 'launch_date_local',
      sorter: (a: Launch, b: Launch) => {
        const dateA = new Date(a.launch_date_local);
        const dateB = new Date(b.launch_date_local);
        return dateA.getTime() - dateB.getTime();
      },
      render: (launchDate: string) => {
        const date = new Date(launchDate);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      },
    },
    {
      title: 'Launch Success',
      dataIndex: 'launch_success',
      key: 'launch_success',
      render: (value: boolean | null) => (value === null ? 'NA' : value ? 'Yes' : 'No'),
    },
    {
      title: 'Favorite',
      dataIndex: 'favorite',
      key: 'favorite',
      render: (favorite: boolean, launch: Launch) => (
        <Button
          type='ghost'
          onClick={() => {
            if (favouriteLaunchIds.includes(launch.id)) {
              console.log("Favourite!!")
              setFavouriteLaunchIds((prevIds) => prevIds.filter(id => id !== launch.id))
              removeFavouriteLaunch(launch)
            } else {
              setFavouriteLaunchIds([...favouriteLaunchIds, launch.id]);
              addFavouriteLaunch(launch)
            }
          }}
        >
          {favorite || favouriteLaunchIds.includes(launch.id) ? (
            <StarFilled style={{ color: "gold" }} />
          ) : (
            <StarOutlined style={{ color: "gold" }} />
          )}
        </Button>
      )
    },
  ];
  //--------------------COLUMNS END------------------------------------------------//



//------------------FETCHING DATA FROM API-----------------------------------//

//call GET_UPCOMING_LAUNCHES query if future tab is seleced otherwise GET_LAUNCHES for past launches
const { loading, error, data } = useQuery<LaunchesData, LaunchesVars>(
  query === 'future' ? GET_UPCOMING_LAUNCHES : GET_LAUNCHES
);
if (loading) return <p><Spin /></p>;
if (error) return <p>Error :</p>;


//---------------OPERATIONS ON DATA------------------------------------------//


  //----FOR FILTERING----------//
  //finding all unique outcomes from the api response for filter dropdown
  const outcomes = query === "future" ? data?.launchesUpcoming.map((item) => item.launch_success) : data?.launchesPast.map((item) => item.launch_success)
  const uniqueOutcomes = new Set<null | boolean | string>();
  if (Array.isArray(outcomes)) {
    outcomes.forEach((outcome) => {
      uniqueOutcomes.add(outcome === null ? "NA" : outcome === true ? "Yes" : "No");
    });
  }

  //set selectedOutcomes to the outcome selected from the filter
  const onOutcomeChange = (value: { [key: number]: string }) => {
    const valuesArray = Object.values(value);
    setSelectedOutcomes(valuesArray);
    console.log(selectedOutcomes.length)
  };

  //finding all unique rockets name from the api response filter dropdown
  const rockets = query === "future" ? data?.launchesUpcoming.map((item) => item.rocket) : data?.launchesPast.map((item) => item.rocket)
  const uniqueRockets = new Set<string>();
  if (Array.isArray(rockets)) {
    rockets.forEach((rocket) => {
      if (typeof rocket.rocket_name === "string") {
        uniqueRockets.add(rocket.rocket_name);
      }
    });
  }

  //set selected Rockets to the value of selected rockets from filter
  const onChange = (value: { [key: number]: string }) => {
    const valuesArray = Object.values(value);
    setSelectedRockets(valuesArray);
  };


  //let filtered data to upcoming if future tab, otherwise set past
  let filteredData = query === "future" ? data?.launchesUpcoming : data?.launchesPast;

  //filtering by rockets
  if (selectedRockets.length > 0) {
    filteredData = filteredData?.filter((launch) =>
      selectedRockets.includes(launch.rocket.rocket_name)
    );
  }

  //filtering by outcomes
  if (selectedOutcomes.length > 0) {
    filteredData = filteredData?.filter((launch) =>
      selectedOutcomes.includes(launch.launch_success === null ? "NA" : launch.launch_success === true ? "Yes" : "No")
    );
  }

  if(favouriteFutureLaunches || favouritePastLaunches){
    filteredData = filteredData?.filter((launch) => {
      return !favouriteFutureLaunches.includes(launch) && !favouritePastLaunches.includes(launch);
    });
  }

  //when filters are removed, set filteredData to original value again
  if (selectedRockets.length === 0 && selectedOutcomes.length === 0) {
    filteredData = query === "future" ? data?.launchesUpcoming : data?.launchesPast;
    filteredData = filteredData?.filter((launch) => {
      return !favouriteFutureLaunches.some( field => field.id === launch.id)
       && !favouritePastLaunches.some( field => field.id === launch.id)
    });

  }




  //---Favourite Tables operations----------------------//

  //setting favouriteLaunches for the favourites table - past and future
  function addFavouriteLaunch(launch: Launch) {
    console.log(query)
    if (query === "past") {
      setfavouritePastLaunches([...favouritePastLaunches, launch])
    }
    else {
      setfavouriteFutureLaunches([...favouriteFutureLaunches, launch])
    }
  }

  //removing favouriteLaunches from the favourites table
  async function removeFavouriteLaunch(launch: Launch) {
    if (query === "past") {
      setfavouritePastLaunches((prevIds) => prevIds.filter(id => id !== launch))
    }
    else if (query === "future")
      setfavouriteFutureLaunches((prevIds) => prevIds.filter(id => id !== launch))

  }

  let filteredFavouritesData = query === "future" ? favouriteFutureLaunches : favouritePastLaunches;

  //filtering by rockets
  if (selectedRockets.length > 0) {
    filteredFavouritesData = filteredFavouritesData?.filter((launch) =>
      selectedRockets.includes(launch.rocket.rocket_name)
    );
  }

  //filtering by outcomes
  if (selectedOutcomes.length > 0) {
    filteredFavouritesData = filteredFavouritesData?.filter((launch) =>
      selectedOutcomes.includes(launch.launch_success === null ? "NA" : launch.launch_success === true ? "Yes" : "No")
    );
  }

  //when filters are removed, set filteredData to original value again
  else if (selectedRockets.length === 0 && selectedOutcomes.length === 0) {
    filteredFavouritesData = query === "future" ? favouriteFutureLaunches : favouritePastLaunches;
  }


  

  //----Filtered Data Operations END --------------------------------//


  //final filtered data for the main table
  const dataSource = filteredFavouritesData.concat(filteredData ??[])

  return (
    <>
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Space direction='vertical'>
          <h1>Filters</h1>
          <Space>
            <Select onChange={onChange} mode='multiple' style={{ minWidth: "200px" }} placeholder="Select Rocket Name" >
              {[...uniqueRockets].map((rocket) => (
                <Select.Option key={rocket} value={rocket}>
                  {rocket}
                </Select.Option>
              ))}
            </Select>
            <Select onChange={onOutcomeChange} mode='multiple' style={{ minWidth: "150px" }} placeholder="Select Outcome" >
              {[...uniqueOutcomes].map((outcome) => (
                <Select.Option value={outcome}>
                  {outcome}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Table
            pagination={{ pageSize: 20 }}
            dataSource={dataSource}
            columns={columns}
          />
        </Space>
      </div>

      {selectedLaunchId && (
        <LaunchDetails
          launchId={selectedLaunchId}
          visible={!!selectedLaunchId}
          onCancel={() => setSelectedLaunchId(null)}
        />
      )}
    </>
  )
}

export default LaunchesTable