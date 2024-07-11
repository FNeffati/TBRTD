// GallerySwitch.jsx
import React, { useState } from 'react';
import Component1 from './FloridaMap';
import Component2 from './TimeSeries';
import ContentHeader from './ContentHeader';
import "../styling/Gallery.css"

const GallerySwitch = ({ date, account_types }) => {

    return (
        <div className="Gallery">
            <div className="Component_Container">
                <div className="Component1">
                    <Component1 date={date} account_types={account_types} className="map"/>
                    <ContentHeader title={"Map"} content={""}/>
                </div>
                <div className="Component2">
                    <Component2 className="ts"/>
                    <ContentHeader title={"Time Series"} content={""}/>
                </div>
            </div>
        </div>
    );
}
export default GallerySwitch;