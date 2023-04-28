import { useState, useEffect } from 'react'
import { Table, Spin, Button, Select, Space } from 'antd';
import { useQuery } from '@apollo/client';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import './components.css'
import LaunchDetails from './LaunchDetails';
import { Launch, LaunchesData, LaunchesVars, queryProp } from '../utils/types';
import { GET_LAUNCHES, GET_UPCOMING_LAUNCHES } from '../utils/queries';
import { SortOrder } from 'antd/lib/table/interface';


const LaunchesTable = ({ query }: queryProp) => {

  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);
  const [favouriteLaunchIds, setFavouriteLaunchIds] = useState<string[]>(() => {
    const savedIds = localStorage.getItem('favouriteLaunchIds');
    if (savedIds) {
      return JSON.parse(savedIds);
    }
    return [];
  });
  const [selectedRockets, setSelectedRockets] = useState<string[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<Array<string | boolean>>([])

  useEffect(() => {
    localStorage.setItem('favouriteLaunchIds', JSON.stringify(favouriteLaunchIds));
  }, [favouriteLaunchIds]);


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
              // remove launch from favorites
              setFavouriteLaunchIds((prevIds) => prevIds.filter(id => id !== launch.id))
              console.log(favouriteLaunchIds)
            } else {
              console.log("Adding favourite!!")
              // add launch to favorites
              setFavouriteLaunchIds([...favouriteLaunchIds, launch.id]);
              console.log(favouriteLaunchIds)
            }
          }}
        >
          {favorite || favouriteLaunchIds.includes(launch.id) ? (
            <StarFilled style={{ color: "gold" }} />
          ) : (
            <StarOutlined style={{ color: "gold" }} />
          )}
        </Button>
      ),
      sorter: (a: Launch, b: Launch) => {
        const aIsFavorite = favouriteLaunchIds.includes(a.id);
        const bIsFavorite = favouriteLaunchIds.includes(b.id);
        if (aIsFavorite && bIsFavorite) {
          return 0;
        } else if (aIsFavorite) {
          return 1;
        } else if (bIsFavorite) {
          return -1;
        } else {
          return 0;
        }
      },
      sortDirections: ['descend'] as SortOrder[],
    },
  ];


  const { loading, error, data } = useQuery<LaunchesData, LaunchesVars>(
    query === 'future' ? GET_UPCOMING_LAUNCHES : GET_LAUNCHES
  );


  if (loading) return <p><Spin /></p>;
  if (error) return <p>Error :</p>;

  const rockets = query === "future" ? data?.launchesUpcoming.map((item) => item.rocket.rocket_name) : data?.launchesPast.map((item) => item.rocket.rocket_name)
  const uniqueRockets = new Set<string>();

  if (Array.isArray(rockets)) {
    rockets.forEach((rocket) => {
      if (typeof rocket === "string") {
        uniqueRockets.add(rocket);
      }
    });
  }
  console.log(uniqueRockets)

  const outcomes = query === "future" ? data?.launchesUpcoming.map((item) => item.launch_success) : data?.launchesPast.map((item) => item.launch_success)
  const uniqueOutcomes = new Set<null | boolean | string>();
  if (Array.isArray(outcomes)) {
    outcomes.forEach((outcome) => {
      uniqueOutcomes.add(outcome === null? "NA":outcome===true ? "Yes":"No");
      // if (typeof outcome === "boolean") {
      //   uniqueOutcomes.add(outcome);
      // }
    });
  }

  const onChange = (value: { [key: number]: string }) => {
    const valuesArray = Object.values(value);
    setSelectedRockets(valuesArray);
  };

  const onOutcomeChange = (value: { [key: number]: string }) => {
    const valuesArray = Object.values(value);
    setSelectedOutcomes(valuesArray);
    console.log(selectedOutcomes.length)
  };


  //filtering data based on selected rockets
  let filteredData = query === "future" ? data?.launchesUpcoming : data?.launchesPast;

  if (selectedRockets.length > 0) {
    filteredData = filteredData?.filter((launch) =>
      selectedRockets.includes(launch.rocket.rocket_name)
    );
  }

  if(selectedOutcomes.length > 0) {
    filteredData = filteredData?.filter((launch) =>
      selectedOutcomes.includes(launch.launch_success === null ? "NA": launch.launch_success === true? "Yes":"No")
    );
  }
  else if(selectedRockets.length===0 && selectedOutcomes.length===0){
    filteredData = query === "future" ? data?.launchesUpcoming : data?.launchesPast;
  }

  
  const dataSource = filteredData;

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
        <Select onChange={onOutcomeChange} mode='multiple' style={{ minWidth: "100px" }} placeholder="Select Outcome" >
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