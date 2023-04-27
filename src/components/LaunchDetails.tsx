import React from 'react';
import { useQuery } from '@apollo/client';
import { Modal, Spin } from 'antd';
import { GET_LAUNCH_DETAILS } from '../utils/queries'
import { LaunchDetailsData, LaunchDetailsProps, LaunchDetailsVars } from '../utils/types';


const LaunchDetails: React.FC<LaunchDetailsProps> = ({
  launchId,
  visible,
  onCancel,
}) => {
  const { loading, error, data } = useQuery<LaunchDetailsData, LaunchDetailsVars>(
    GET_LAUNCH_DETAILS,
    { variables: { id: launchId } },
  );

  if (loading) {
    return (
      <Modal open={visible} onCancel={onCancel}>
        <Spin />
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal open={visible} onCancel={onCancel}>
        <p>Error: {error.message}</p>
      </Modal>
    );
  }

  if (!data) {
    return (
      <Modal open={visible} onCancel={onCancel}>
        <p>No data found.</p>
      </Modal>
    );
  }

  const { mission_name, rocket, launch_date_local, launch_success, details } =
    data.launch;

  

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title={mission_name}
      width={'90%'}
      style={{ maxWidth: '800px' }}
      footer={null}
    >
      <p><strong>Rocket Name: </strong>{rocket.rocket_name}</p>
      <p><strong>Rocket Type: </strong>{rocket.rocket_type}</p>
      <p><strong>Launch Date: </strong>{launch_date_local}</p>
      <p><strong>Launch Success:</strong> {launch_success ? 'Yes' : 'No'}</p>
      <p><strong>Details: </strong> {details ? details : "NA"}</p>
    </Modal>
  );
};

export default LaunchDetails;