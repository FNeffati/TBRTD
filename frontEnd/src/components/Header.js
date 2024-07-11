import React from 'react';
import '../styling/Header.css';


const Header = () => {
    return (
        <div className="header_container">
            <header>
                <div className="logo">Tampa Bay Twitter Red Tide Analytics Dashboard</div>
                <p>
                    <ul className="bodyText">
                        <strong>Objective:</strong> Our goal is to collect, analyze, and present publicly available twitter data to users in a digestible way. <br/>
                        <strong>Source of Data:</strong> All of these tweets are collected from X due to them pertaining/mentioning Red Tide and/or the Tampa Bay area 5 Key counties.
                    </ul>
                </p>

            </header>

        </div>

    );
};

export default Header;
