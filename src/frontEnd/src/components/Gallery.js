// GallerySwitch.jsx
import React, { useState } from 'react';
import Component1 from './FloridaMap';
import Component2 from './TimeSeries';
import ContentHeader from './ContentHeader';
import "../styling/Gallery.css"
import Filters from './Filters';

const GallerySwitch = ({ date, account_types, retweetFilter }) => {
    return (
        <div className="Gallery">
            <div className="Component_Container">
                <div className="Component1">
                    <ContentHeader title={"Map"} content={"Tweet counts show by county of origin."} filters={"Affected by time frame, account type, and retweet filters."}/>
                    <Component1 date={date} account_types={account_types} retweetFilter={retweetFilter} className="map"/>
                </div>
                <div className="Component2">
                    <ContentHeader title={"Time Series"} content={"Click and drag on a section to zoom in closer. Double click to reset view. Use search to focus on a given word or phrase. To get the exact tweet counts for each county, hover over the respective part of the graph"} filters={"Affected by account type and retweet filters."}/>
                    <Component2 account_types={account_types} retweetFilter={retweetFilter} className="ts"/>
                </div>
            </div>
        </div>
    );
};
export default GallerySwitch;