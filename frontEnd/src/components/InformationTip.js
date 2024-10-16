import React from "react";
import '../styling/InformationTip.css'

/**
 * InformationTip component to display an information tooltip when you hover over them.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.information - The information to be displayed inside the tooltip. This string can contain HTML content.
 * @param {string} props.title - The title of the tooltip.
 */

function InformationTip({ information, title }) {
    return (
        <div className="tooltip">
            <span className="info-icon">{title}ℹ</span>
            <span className="tooltip-text" dangerouslySetInnerHTML={{ __html: information }}></span>
        </div>
    );
}

export default InformationTip;
