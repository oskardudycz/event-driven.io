import React from 'react';

function asyncComponent<Props extends object>(
  getComponent: () => Promise<React.ComponentType<Props> | void>,
  loadingComponent?: React.ReactNode,
) {
  return class AsyncComponent extends React.Component<
    Props,
    { component: React.ComponentType<Props> | null }
  > {
    state: { component: React.ComponentType<Props> | null } = { component: null };

    componentDidMount() {
      if (!this.state.component) {
        getComponent()
          .then((component) => {
            if (component) this.setState({ component });
          })
          .catch((error: unknown) => console.error('Could not load component', error));
      }
    }
    render() {
      const { component: Comp } = this.state;
      if (Comp) return <Comp {...this.props} />;
      return loadingComponent ? loadingComponent : <div>Loading...</div>;
    }
  };
}

export default asyncComponent;
