// GallerySwitch.jsx
import React, { useState } from 'react';
import Component1 from './FloridaMap';
import Component2 from './TimeSeries';
import ContentHeader from './ContentHeader';
import "../styling/Gallery.css"

const GallerySwitch = ({ date, account_types, retweetFilter }) => {
    return (
        <div className="Gallery">
            <div className="Component_Container">
                <div className="Component1">
                    <Component1 date={date} account_types={account_types} retweetFilter={retweetFilter} className="map"/>
                    <ContentHeader title={"Map"} content={"Tweet counts by county, can be filtered by account type."}/>
                </div>
                <div className="Component2">
                    <Component2 account_types={account_types} retweetFilter={retweetFilter} className="ts"/>
                    <ContentHeader title={"Time Series"} content={"Click and drag on a section to zoom in closer. Double click to reset view. Results can be filtered by account type. Use search to focus on a given word or phrase."}/>
                </div>
            </div>
        </div>
    );
};
export default GallerySwitch;