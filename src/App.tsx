import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean,
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);

    this.state = {
      data: [],
      showGraph: false,
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    return this.state.showGraph ? <Graph data={this.state.data} /> : null;
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    this.setState({ showGraph: true });

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        // Update the state by creating a new array of data that consists of
        // Previous data in the state and the new data from server
        this.setState((prevState) => ({
          data: [...prevState.data, ...serverResponds]
        }));
      });
    }, 100);
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is clicked, our react app tries to request
            // new data from the server.
            onClick={() => { this.getDataFromServer() }}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
