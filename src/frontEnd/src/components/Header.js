import React from 'react';
import '../styling/Header.css';

const Header = () => {
    return (
        <div className="header_container">
            <header>
                <div className="logo">Tampa Bay Twitter Red Tide Analytics Dashboard</div>
                <p>
                    <ul className="bodyText">
                        <strong className="item">Objective:</strong> Primary purpose of the dashboard is to provide regional stakeholders, researchers and managers with a tool that allows retrospective analysis of public discussions about red tide. It should help summarize most cited public concerns, level of awareness and education around the issue. It should not be used as a source of reliable information on the red tide itself.<br/>
                        <strong className="item">Source of Data:</strong> All of these tweets are collected from X due to them pertaining/mentioning Red Tide and/or the Tampa Bay area 5 Key counties.
                        <p className="disclaimer">For ideal perfomance and layout, please use on a laptop or desktop PC.</p>
                    </ul>
                </p>
            </header>
        </div>
    );
};

export default Header;
