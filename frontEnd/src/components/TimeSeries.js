import React, { useEffect, useRef, useState } from 'react';
import Dygraph from 'dygraphs';
import "../styling/TimeSeries.css";

/**
 * TwitterTimeSeries component renders a time series graph of tweet counts per county using Dygraphs.
 * Dygraphs package link: https://www.npmjs.com/package/dygraphs
 */
const TwitterTimeSeries = () => {
    const graphRef = useRef(null);
    const [data, setData] = useState();

    const fetchTweets = () => {
        /**
         * Fetches all the tweet data from the server with no filtering.
         */
        fetch('/get_tweets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([])
        })
            .then((response) => response.json())
            .then((data) => {
                setData(data);
            })
            .catch((error) => console.error(error));
    };

    // Fetch tweets data when the component mounts or data changes
    useEffect(() => {
        if (!data) {
            fetchTweets();
        }
    }, [data]);

    // Update the graph when data is available
    useEffect(() => {
        if (graphRef.current && data) {
            const counties = ['Sarasota', 'Manatee', 'Hillsborough', 'Pinellas', 'Pasco'];
            const locationArrays = {};

            counties.forEach((county) => {
                locationArrays[county] = {};
            });

            // Process tweet data to count tweets per county per date
            data.forEach((tweet) => {
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
                colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
            });
        }
    }, [data]);

    return <div ref={graphRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default TwitterTimeSeries;
