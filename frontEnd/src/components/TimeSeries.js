import React, { useEffect, useRef, useState, useCallback } from 'react';
import Dygraph from 'dygraphs';
import "../styling/TimeSeries.css";

/**
 * TwitterTimeSeries component renders a time series graph of tweet counts per county using Dygraphs.
 * Dygraphs package link: https://www.npmjs.com/package/dygraphs
 */
const TwitterTimeSeries = ({ account_types, retweetFilter }) => {
    const graphRef = useRef(null);
    const [data, setData] = useState();
    const [inputValue, setInputValue] = useState(''); // State for input field value
    const [searchTerm, setSearchTerm] = useState(''); // Search term state
    const [filteredData, setFilteredData] = useState(); // State to hold filtered data

    // Cache to store fetched data
    const cache = useRef({});

    /**
     * Generates a unique cache key based on account types and retweet filter.
     * @returns {string} The generated cache key.
     */
    const generateCacheKey = () => {
        return JSON.stringify({ account_types, retweetFilter });
    };

    const fetchTweets = useCallback(() => {
        const withRetweets = retweetFilter === 'With Retweets';
        const filters = [
            {
                "timeFrame": "", // all time 
                "county": [], //all counties 
                "accountType": account_types.length ? account_types : ["Academic", "Government", "Media", "Other", "Tourism"] // Fetch all if empty
            },
            {
                "retweets": withRetweets
            }
        ];

        const cacheKey = generateCacheKey();

        // Check if the data is already in cache
        if (cache.current[cacheKey]) {
            setData(cache.current[cacheKey]);
        } else {
            fetch('/get_tweets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            })
                .then((response) => response.json())
                .then((data) => {
                    setData(data);
                    // Store the data in cache
                    cache.current[cacheKey] = data;
                })
                .catch((error) => console.error(error));
        }
    }, [account_types, retweetFilter]);

    // Fetch tweets on component mount and when account types or retweet filter change
    useEffect(() => {
        fetchTweets();
    }, [fetchTweets]);

    // Function to escape special characters in the search term
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Filter tweets based on the search term
    useEffect(() => {
        if (data) {
            if (searchTerm) {
                const escapedTerm = escapeRegExp(searchTerm.trim());
                const exactWordRegex = new RegExp(`(^|\\s)${escapedTerm}($|\\s)`, 'i');
                const filteredTweets = data.filter(tweet => exactWordRegex.test(tweet.text));
                setFilteredData(filteredTweets);
            } else {
                setFilteredData(data); // If no search term, show all data
            }
        } else {
            console.log('Data not yet available');
        }
    }, [data, searchTerm]);

    // Update the graph when filteredData is available
    useEffect(() => {
        if (graphRef.current && filteredData) {
            const counties = ['Sarasota', 'Manatee', 'Hillsborough', 'Pinellas', 'Pasco'];
            const locationArrays = {};

            counties.forEach((county) => {
                locationArrays[county] = {};
            });

            // Process tweet data to count tweets per county per date
            filteredData.forEach((tweet) => {
                const date = new Date(tweet.time.$date);
                const dateString = date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
                const location = tweet.location;

                if (locationArrays[location]) {
                    if (!locationArrays[location][dateString]) {
                        locationArrays[location][dateString] = 0;
                    }
                    locationArrays[location][dateString]++;
                }
            });

            const dyData = {};
            Object.keys(locationArrays).forEach((location) => {
                Object.keys(locationArrays[location]).forEach((dateString) => {
                    const date = new Date(dateString);
                    const formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    if (!dyData[formattedDate]) {
                        dyData[formattedDate] = [formattedDate, 0, 0, 0, 0, 0]; // Initialize counts for all counties
                    }
                    dyData[formattedDate][counties.indexOf(location) + 1] = locationArrays[location][dateString];
                });
            });

            // Fill in missing dates with zeros
            const allDates = Object.keys(dyData).map(date => new Date(date)).sort((a, b) => a - b);
            const startDate = allDates[0];
            const endDate = allDates[allDates.length - 1];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) { // Loop through all dates between start and end date
                const formattedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                if (!dyData[formattedDate]) {
                    // Add a zeroed-out entry for the missing date
                    dyData[formattedDate] = [formattedDate, 0, 0, 0, 0, 0];
                }
                currentDate.setDate(currentDate.getDate() + 1); // Increment date
            }

            const finalData = Object.values(dyData);

            // Sort the data by date
            finalData.sort((a, b) => a[0] - b[0]);

            // Initialize Dygraph with processed data
            new Dygraph(graphRef.current, finalData, {
                labels: ['Date', 'Sarasota', 'Manatee', 'Hillsborough', 'Pinellas', 'Pasco'],
                showRoller: false,
                rollPeriod: 0,
                width: 750,
                height: 550,
                pixelsPerLabel: 50,
                includeZero: true,
                connectSeparatedPoints: false,
                colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
            });
        }
    }, [filteredData]);

    // Function to handle key down event on the search bar
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSearchTerm(inputValue); // Update the search term state when Enter key is pressed
        }
    };

    // Function to clear the search term and input field
    const handleClearSearch = () => {
        setInputValue(''); // Clear the input field
        setSearchTerm(''); // Clear the search term state to reset to full data
    };

    return (
        <div>
            <div className="time_search_bar_container">
                <input
                    className="time_tweet_search_bar"
                    type="text"
                    placeholder="Use 'Enter' to search a word or phrase. Press clear to reset."
                    value={inputValue} // Controlled component for input
                    onChange={(e) => setInputValue(e.target.value)} // Update input value state
                    onKeyDown={handleKeyDown} // Trigger search on Enter key press
                />
                <button className="time_clear_button" onClick={handleClearSearch}>
                    Clear
                </button>
            </div>
            <div ref={graphRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default TwitterTimeSeries;