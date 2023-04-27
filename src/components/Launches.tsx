import { useState } from 'react';
import { Tabs } from 'antd';
import LaunchesTable from './LaunchesTable';

const Launches = () => {

    const [activeTab, setActiveTab] = useState<string>('1');
    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    const { TabPane } = Tabs
    return (
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
            <TabPane tab="Past" key="1" >
                <LaunchesTable query='past' />
            </TabPane>
            <TabPane tab="Upcoming" key="2">
                <LaunchesTable query='future' />
            </TabPane>
        </Tabs>
    )
}

export default Launches