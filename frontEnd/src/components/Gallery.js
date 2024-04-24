// GallerySwitch.jsx
import React, { useState } from 'react';
import Component1 from './FloridaMap';
import Component2 from './TimeSeries';
import "../styling/Gallery.css"

const GallerySwitch = ({ date, account_types }) => {
    const [activeComponent, setActiveComponent] = useState(1);
    const [canGoLeft, setCanGoLeft] = useState(true);
    const [canGoRight, setCanGoRight] = useState(false);

    const handleArrowClick = (direction) => {
        setActiveComponent((prevComponent) => {
            if (direction === 'left') {
                if (prevComponent === 1) {
                    setCanGoLeft(false);
                    setCanGoRight(true);
                    return 2;
                } else {
                    setCanGoLeft(true);
                    setCanGoRight(false);
                    return 1;
                }
            } else {
                if (prevComponent === 2) {
                    setCanGoLeft(true);
                    setCanGoRight(false);
                    return 1;
                } else {
                    setCanGoLeft(false);
                    setCanGoRight(true);
                    return 2;
                }
            }
        });
    };

    return (
        <div className="Gallery">
            <div className="Arrow_Container">
                <div
                    className={`Left_Arrow ${canGoLeft ? '' : 'disabled'}`}
                    onClick={canGoLeft ? () => handleArrowClick('left') : null}
                >
                    &larr;
                </div>
                <div
                    className={`Right_Arrow ${canGoRight ? '' : 'disabled'}`}
                    onClick={canGoRight ? () => handleArrowClick('right') : null}
                >
                    &rarr;
                </div>
            </div>
            <div className="Component_Container">
                {activeComponent === 1 && <Component1 date={date} account_types={account_types} />}
                {activeComponent === 2 && <Component2 />}
            </div>
        </div>
    );
};

export default GallerySwitch;