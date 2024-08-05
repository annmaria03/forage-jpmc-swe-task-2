import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer', {
      'view': 'y_line',
      'column-pivots': JSON.stringify(["stock"]),
      'row-pivots': JSON.stringify(["timestamp"]),
      'columns': JSON.stringify(["top_ask_price"]),
      'aggregates': JSON.stringify({
        stock: 'distinct count',
        top_ask_price: 'avg',
        top_bid_price: 'avg',
        timestamp: 'distinct count'
      })
    });
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Every time the data props is updated, insert the data into Perspective table
    if (this.table) {
      // Aggregate and remove duplicate data
      const uniqueData = new Map<string, any>();

      this.props.data.forEach((el: any) => {
        const key = `${el.stock}-${el.timestamp}`;
        if (!uniqueData.has(key)) {
          uniqueData.set(key, {
            stock: el.stock,
            top_ask_price: (el.top_ask && el.top_ask.price) || 0,
            top_bid_price: (el.top_bid && el.top_bid.price) || 0,
            timestamp: el.timestamp,
          });
        } else {
          const existing = uniqueData.get(key);
          uniqueData.set(key, {
            stock: existing.stock,
            top_ask_price: (existing.top_ask_price + ((el.top_ask && el.top_ask.price) || 0)) / 2,
            top_bid_price: (existing.top_bid_price + ((el.top_bid && el.top_bid.price) || 0)) / 2,
            timestamp: el.timestamp,
          });
        }
      });

      this.table.update(Array.from(uniqueData.values()));
    }
  }
}

export default Graph;
