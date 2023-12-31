import React, { useEffect } from 'react';
import EventEmitter from 'events';

function App() {
  useEffect(() => {
    // Create an instance of the EventEmitter
    const eventEmitter = new EventEmitter();

    // Relay function to emit events
    function relay(event, payload) {
      eventEmitter.emit(event, payload);
    }

    // Event handlers
    function handleEventA(payload) {
      console.log('Event A:', payload);
      // Perform actions for Event A
    }

    function handleEventB(payload) {
      console.log('Event B:', payload);
      // Perform actions for Event B
    }

    // Register event handlers
    eventEmitter.on('eventA', handleEventA);
    eventEmitter.on('eventB', handleEventB);

    // Emitting events
    relay('eventA', { data: 'Hello from Event A' });
    relay('eventB', { data: 'Hello from Event B' });

    // Cleanup function to remove event listeners
    return () => {
      eventEmitter.removeAllListeners();
    };
  }, []);

  return (
    <div className="App">
      <h1>Event Handling with EventEmitter</h1>
    </div>
  );
}

export default App;

