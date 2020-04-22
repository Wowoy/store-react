import React from 'react';
import axios from 'commons/axios';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ToolBox from 'components/ToolBox';
import Product from 'components/Product';
import Panel from 'components/Panel';
import AddInventory from 'components/AddInventory';



class Products extends React.Component {
  state = {
    products: [],
    sourceProducts: [],
    cartNum: 0 //状态提升（ToolBox和Product组件）
  };

  componentDidMount() {
    axios.get('/products').then(res => {
      this.setState({
        products: res.data,
        sourceProducts: res.data
      });
    });
    this.updateCartNum();
  }

  updateCartNum = async () => {
      const cartNum = await this.initCartNum();
        this.setState({
          cartNum: cartNum
        });
  };

  initCartNum = async () => {
      const user = global.auth.getUser() || {};
      const res = await axios.get('/carts', {
        params: {
          userId: user.email
        }
      });
      const carts = res.data || [];
      const cartNum = carts
        .map(cart => cart.mount) // [2, 1,2 ]
        .reduce((prev, value) => prev + value, 0);
      return cartNum;
  };

  // search(web handle)
  search = text => {
    // 1. Get New Array
    let _products = [...this.state.sourceProducts];

    // 2. Filter New Array
    _products = _products.filter(p => {
      // name: Abcd text: ab   ===> ['Ab']
      // name: Abcd text: e   ===> null
      // text: '' ==> ["", "", "", "", ""]
      const matchArray = p.name.match(new RegExp(text, 'gi'));
      return !!matchArray;
    });

    // 3. set State
    this.setState({
      products: _products
    });
  };

  toAdd = ()=>{
    Panel.open({
        component: AddInventory,
        callback: data=>{
            console.log(data);
            if (data) {
              this.add(data);
            }
        }
    });
  }

  add = product => {
      const _products = [...this.state.products];
      _products.push(product);
      const _sProducts = [...this.state.sourceProducts];
      _sProducts.push(product);

      this.setState({
        products: _products,
        sourceProducts: _sProducts
      });
  };

  update = product => {
      const _products = [...this.state.products];
      const _index = _products.findIndex(p => p.id === product.id);
      _products.splice(_index, 1, product); //替换被更新的product
      const _sProducts = [...this.state.sourceProducts];
      const _sIndex = _products.findIndex(p => p.id === product.id);
      _sProducts.splice(_sIndex, 1, product);
      this.setState({
        products: _products,
        sourceProducts: _sProducts
      });
  };

  delete = id => {
    const _products = this.state.products.filter(p => p.id !== id);
    const _sProducts = this.state.sourceProducts.filter(p => p.id !== id);
    this.setState({
      products: _products,
      sourceProducts: _sProducts
    });
  };

  render() {
    return (
      <div>
        <ToolBox search={this.search} cartNum={this.state.cartNum} />
        <div className="products">
          <div className="columns is-multiline is-desktop">
          <TransitionGroup component={null}>
                { 
                    this.state.products.map(p=>(
                      <CSSTransition
                        classNames="product-fade"
                        timeout={300}
                        key={p.id}
                      >
                        <div className="column is-3" key={p.id}>
                            <Product product={p} update={this.update} delete={this.delete} updateCartNum={this.updateCartNum}/>
                        </div>
                      </CSSTransition>
                    ))
                }
           </TransitionGroup>
            </div>
            {(global.auth.getUser() || {}).type === 1 && (
            <button className="button is-primary add-btn" onClick={this.toAdd}>
              add
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default Products;
