import 'antd/dist/reset.css';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom'
import { ConfigProvider, Layout, theme} from 'antd';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Launches from './components/Launches';
import NavBar from './components/NavBar';

function App() {

  const client = new ApolloClient({
    uri: '/graphql',
    cache: new InMemoryCache(),
  })

  const { Content } = Layout

  return (
    <div className='App'>
      <Router>
        <ApolloProvider client={client}>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm
            }}
          >
            <Layout>
              <NavBar />
              <div className='heading-container'>
                <h1 className='heading'>SpaceX launches</h1>
              </div>
              <Content className='container'>
                <Launches />
              </Content>
            </Layout>
          </ConfigProvider>
        </ApolloProvider>
      </Router>
    </div>
  );
}

export default App;
