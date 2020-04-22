import React from 'react';
import Products from 'components/Products'
import Layout from 'Layout';

class Home extends React.Component {
    render() {
        return  (
            <Layout>
                <Products />
            </Layout>
        )
    }
}

export default Home;

