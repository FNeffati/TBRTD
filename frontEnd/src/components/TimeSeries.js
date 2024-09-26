import React, { useEffect, useRef, useState, useCallback } from 'react';
import Dygraph from 'dygraphs';
import "../styling/TimeSeries.css";

/**
 * TwitterTimeSeries component renders a time series graph of tweet counts per county using Dygraphs.
 * Dygraphs package link: https://www.npmjs.com/package/dygraphs
 */
const TwitterTimeSeries = ({ account_types }) => {
    const graphRef = useRef(null);
    const [data, setData] = useState();
    const [searchTerm, setSearchTerm] = useState(''); // Search term state
    const [filteredData, setFilteredData] = useState(); // State to hold filtered data

    const fetchTweets = useCallback(() => {
        const filters = [
            {
                "timeFrame": "", // all counties 
                "county": [], // all time 
                "accountType": account_types.length ? account_types : ["Academic", "Government", "Media", "Other", "Tourism"] // Fetch all if empty
            },
            {
                "retweets": true // with retweets for now 
            }
        ];
    
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
            })
            .catch((error) => console.error(error));
    }, [account_types]);
    
    // Fetch tweets on component mount and when account types change
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
            console.error('Data not available to filter');
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
                pixelsPerLabel: 40,
                colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
            });
        }
    }, [filteredData]);

    return (
        <div>
            <div className="search_bar_container">
                <input
                    className="tweet_search_bar"
                    type="text"
                    placeholder="Filter tweets by words"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear_button" onClick={() => setSearchTerm('')}>
                        Clear
                    </button>
                )}
            </div>
            <div ref={graphRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default TwitterTimeSeries;