import React from 'react';
import '../styling/ContentHeader.css';

const ContentHeader = ({ title, content }) => {
    return (
        <div className="Container">
            <h4 className="Title">{title}</h4>
            <p className="Body">{content}</p>
        </div>
    );
};

export default ContentHeader;