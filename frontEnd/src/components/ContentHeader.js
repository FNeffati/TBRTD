import React from 'react';
import '../styling/ContentHeader.css';

const ContentHeader = ({ title, content, filters }) => {
    return (
        <div className="InfoContainer">
            <h4 className="InfoTitle">{title}</h4>
            <p className="InfoBody">{content}</p>
            <p className="InfoFilters"><strong>{filters}</strong></p>
        </div>
    );
};

export default ContentHeader;