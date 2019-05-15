/*
 * @Author: dylan-farm
 * @Date: 2019-05-15 15:37:20
 * @LastEditors: mahongwei5
 * @LastEditTime: 2019-05-15 15:59:53
 */
import React, { Component } from "react";
import PropTypes from "prop-types";

export const connect = (
  mapStateToProps = () => {},
  mapDispatchToProps = () => {}
) => WrappedComponent =>
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    };

    constructor(props) {
      super(props);
      this.state = {
        allProps: {}
      };
    }

    componentWillMount() {
      const { store } = this.context;
      this._updateProps();
      store.subscribe(() => this._updateProps());
    }

    _updateProps() {
      const { store } = this.context;
      const stateProps = mapStateToProps(store.getState(), this.props);
      const dispatchProps = mapDispatchToProps(store.dispatch, this.props);
      this.setState({
        allProps: {
          ...stateProps,
          ...dispatchProps,
          ...this.props
        }
      });
    }

    render() {
      return <WrappedComponent {...this.state.allProps} />;
    }
  };
