import React, {useState} from 'react';
import '../styling/TimeFrameSelector.css'
import InformationTip from "./InformationTip";
import {preventDefault} from "leaflet/src/dom/DomEvent";


function TimeFrameSelector({ onTimeFrameChange }) {

    const today = new Date();
    const year = today.getFullYear();

    let month = today.getMonth() + 1;
    let day = today.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    const todayFormatted = `${year}-${month}-${day}`;


    const [startDate, setStartDate] = useState('2018-06-30');
    const [endDate, setEndDate] = useState(todayFormatted)

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
        onTimeFrameChange(e.target.value, endDate);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
        onTimeFrameChange(startDate, e.target.value);
    };

    return (
        <div>
            <InformationTip information={"<ul> <li><strong>Default:</strong> From 2018 to Present Day</li>  <li><strong>Functionality:</strong> specify a time frame to see tweets from.</li> </ul>"}/>
            <div className="time-frame-selector clearfix">
                <label>
                    <input type="date" value={startDate} onChange={handleStartDateChange} onKeyDown={(e)=>(preventDefault(e))} />
                </label>
                <label>
                    <input type="date" value={endDate} onChange={handleEndDateChange} onKeyDown={(e)=>(preventDefault(e))}/>
                </label>
            </div>
        </div>
    );
}

export default TimeFrameSelector;