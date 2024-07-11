import React from 'react';
import '../styling/ContentHeader.css';

const ContentHeader = ({ title, content }) => {
    return (
        <div className="InfoContainer">
            <h4 className="InfoTitle">{title}</h4>
            <p className="InfoBody">{content}</p>
        </div>
    );
};

export default ContentHeader;