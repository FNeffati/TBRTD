import './App.css';
import Header from "./components/Header";
import Filters from "./components/Filters";
import TimeFrameSelector from "./components/TimeFrameSelector";
import Twitter from "./components/Twitter";
import React, { useState, useEffect } from 'react';
import WordCloud from "./components/WordCloud";
import GallerySwitch from "./components/Gallery";
import ContentHeader from './components/ContentHeader';
import FAQ from './components/faq';

import { Routes, Route, Link } from 'react-router-dom';

function MainApp() {

    const [tweets, setTweets] = useState([]);
    const Account_Type_Options = ["Academic", "Government", "Media", "Other", "Tourism"];
    const County_Options = ["Pasco", "Pinellas", "Hillsborough", "Manatee", "Sarasota"];
    const Word_Cloud_Options = ["Geo Hashtags", "Non-Geo Hashtags", 'Geo Single Terms', 'Non Geo Single Terms', 'Geo Single User', 'Non-Geo Single User'];
    const Tweet_Filter_Options = ["With Retweets", "Without Retweets"];


    const [selectedFilters, setSelectedFilters] = useState({
        timeFrame: "2018-06-30 2024-08-23",
        accountType: [],
        county: [],
        wordCloud: [],
        retweetFilter: "Without Retweets", // default to no retweets 
    });

    /* 
    * Function to handle changes in the filters
    * @param {string} filterType - the type of filter being changed
    * @param {string} selectedOptions - the selected options for the filter
    * 
    * This function is called when a filter is changed. It updates the selectedFilters state with the new filter options.
    */
    const handleFilterChange = (filterType, selectedOptions) => {
        setSelectedFilters(prevState => ({
            ...prevState,
            [filterType]: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions]
        }));
    };

    /*
    * Function to handle changes in the time frame
    * @param {string} start - the start date of the time frame
    * @param {string} end - the end date of the time frame
    * 
    * This function is called when the time frame is changed. It updates the selectedFilters state with the new time frame.
    */
    const handleTimeFrameChange = (start, end) => {
        handleFilterChange('timeFrame', start + " " + end);
    };

    /*
    * Function to handle new tweets
    * @param {array} newTweets - the new tweets to display
    * 
    * This function is called when new tweets are fetched. It updates the tweets state with the new tweets.
    */
    const handleTweets = (newTweets) => {
        setTweets(newTweets);
    };

    const [clickedWord, setClickedWord] = useState("");

    /*
    * Function to handle clicks on words in the word cloud
    * @param {string} word - the word that was clicked
    * 
    * This function is called when a word in the word cloud is clicked. It updates the clickedWord state with the new word.
    */
    const handleWordClick = (word) => {
        setClickedWord(word)
    };

    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1400);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleFilterDropdown = () => {
        setIsFilterDropdownOpen(!isFilterDropdownOpen);
    };

    const FilterDropdown = () => (
        <div className={`filter-dropdown ${isFilterDropdownOpen ? 'open' : ''}`}>
            <TimeFrameSelector onTimeFrameChange={handleTimeFrameChange} />
            <Filters
                options={Account_Type_Options}
                Title={"ACCOUNT TYPE"}
                information={"<ul><li><strong>Default:</strong> All Accounts are selected</li><li><strong>Functionality:</strong> Click an option to see tweets from accounts under that category.</li></ul>"}
                onChange={(selectedOptions) => handleFilterChange('accountType', selectedOptions)}
                changeTitleOnSelect={true}
            />
            <Filters
                options={Word_Cloud_Options}
                Title={"WORD CLOUD"}
                information={"<ul><li><strong>Default:</strong> Non Geo Hashtags Selected</li><li><strong>Functionality:</strong> Click an option to see the counts of hashtags under that category.</li></ul>"}
                onChange={(selectedOptions) => handleFilterChange('wordCloud', selectedOptions)}
                isMultiChoice={false}
                changeTitleOnSelect={true}
            />
            <Filters
                options={County_Options}
                Title={"COUNTY"}
                information={"<ul><li><strong>Default:</strong> All counties selected.</li><li><strong>Functionality:</strong> Upon hovering a county, the Map will display how many tweets are about that county.</li></ul>"}
                onChange={(selectedOptions) => handleFilterChange('county', selectedOptions)}
                changeTitleOnSelect={true}
            />
            <Filters 
                options={Tweet_Filter_Options} 
                Title={"RETWEETS"} 
                information={"<ul><li><strong>Default:</strong> Without Retweets</li><li><strong>Functionality:</strong> Select to include or exclude retweets in the displayed tweets.</li></ul>"} 
                onChange={(selectedOptions) => handleFilterChange('retweetFilter', selectedOptions[0])}
                isMultiChoice={false} 
                changeTitleOnSelect={true} 
            />
        </div>
    );



    return (
        <div className="App">
            <header className="App-header">
                <Header />
            </header>
            <div className="Filters_Bar">
                {isMobile ? (
                    <>
                        <button className="filter-dropdown-toggle" onClick={toggleFilterDropdown}>
                            {isFilterDropdownOpen ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        <FilterDropdown />
                    </>
                ) : (
                    <>
                        <TimeFrameSelector onTimeFrameChange={handleTimeFrameChange} />
                        <Filters options={Word_Cloud_Options} Title={"WORD CLOUD"} information={"<ul><li><strong>Default:</strong> Non Geo Hashtags Selected</li><li><strong>Functionality:</strong> Click an option to see the counts of hashtags under that category.</li></ul>"} onChange={(selectedOptions) => handleFilterChange('wordCloud', selectedOptions)} isMultiChoice={false} changeTitleOnSelect={true} />
                        <Filters options={County_Options} Title={"COUNTY"} information={"<ul><li><strong>Default:</strong> All counties selected.</li><li><strong>Functionality:</strong> Upon hovering a county, the Map will display how many tweets are about that county.</li></ul>"} onChange={(selectedOptions) => handleFilterChange('county', selectedOptions)} changeTitleOnSelect={true} />
                        <Filters options={Account_Type_Options} Title={"ACCOUNT TYPE"} information={"<ul><li><strong>Default:</strong> All Accounts are selected</li><li><strong>Functionality:</strong> Click an option to see tweets from accounts under that category.</li></ul>"} onChange={(selectedOptions) => handleFilterChange('accountType', selectedOptions)} changeTitleOnSelect={true} />
                        <Filters options={Tweet_Filter_Options} Title={"RETWEETS"} information={"<ul><li><strong>Default:</strong> Without Retweets</li><li><strong>Functionality:</strong> Select to include or exclude retweets in the displayed tweets.</li></ul>"} onChange={(selectedOptions) => handleFilterChange('retweetFilter', selectedOptions)} isMultiChoice={false} changeTitleOnSelect={true} />
                    </>
                )}
            </div>
            <div className="Body">
                <div className="Twitter_container">
                    <ContentHeader
                        title="Tweet Display"
                        content="Shows individual tweets related to red tide in the Tampa Bay area. Includes tweet content, date, location, and engagement metrics."
                    />
                    <Twitter selectedFilters={selectedFilters} onTweetsFetched={handleTweets} clickedWord={clickedWord}/>
                </div>
                <div className="Word_Cloud_container">
                    <ContentHeader title={"Word Cloud"} content={"Click on a word to see the tweets that contain it. Clicking a word will override your current search term."} />
                    <WordCloud cloud_type={selectedFilters.wordCloud} tweets={tweets} onWordCloudClick={handleWordClick} retweetFilter={selectedFilters.retweetFilter}/>
                </div>
                <div className="Map_container">
                    <ContentHeader title={"Map / Time Series"} content={"Explore the data with visual representations of county of origin (Map) and tweets over time (Time-Series)."}/>
                    <GallerySwitch account_types={selectedFilters.accountType} date={selectedFilters.timeFrame} retweetFilter={selectedFilters.retweetFilter} />
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
    <div>
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/faq">How to use this Dashboard</Link></li>
            </ul>
        </nav>
        <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/faq" element={<FAQ />} />
        </Routes>
    </div>
    );
}

export default App;
