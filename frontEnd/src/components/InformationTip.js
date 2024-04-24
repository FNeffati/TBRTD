import React from "react";
import '../styling/InformationTip.css'




function InformationTip({information}) {


    return(
        <div className="tooltip">
            <span className="info-icon">ℹ</span>
            <span className="tooltip-text" dangerouslySetInnerHTML={{ __html: information }}></span>
        </div>
    )

}

export default InformationTip