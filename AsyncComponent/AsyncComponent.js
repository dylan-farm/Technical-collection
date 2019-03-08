import React, { Component } from "react";

export default (asyncComponent = importComponent =>
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);

      this.state = {
        Component: null
      };
    }

    async componentWillMount() {
      if (this.hasImportComponent()) {
        return;
      }
      try {
        const module = await importComponent();
        this.setState({
          Component: module.default
        });
      } catch (err) {
        console.error(`Cannot load Component in <AsyncComponent />`);
        throw err;
      }
    }
    hasImportComponent() {
      return this.state.Component !== null;
    }

    render() {
      const { Component } = this.state;
      return Component ? <Component {...this.props} /> : null;
    }
  });
