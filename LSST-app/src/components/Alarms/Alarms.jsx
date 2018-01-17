import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import './Alarms.css';
import Building from './Building/Building';
import CableWraps from './CableWraps/CableWraps';
// import openSocket from 'socket.io-client';

class Alarms extends Component {

    receiveBuildingData = (msg) => {
        console.log('receiveBuildingData', msg);
    }

    render() {
        return (
            <div className="alarms-container">
                <Building />
                <CableWraps />
            </div>
        );
    }
}

export default Alarms;