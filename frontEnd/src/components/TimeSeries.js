import React, { useEffect, useRef, useState } from 'react';
import Dygraph from 'dygraphs';
import "../styling/TimeSeries.css"

const TwitterTimeSeries = () => {
    const graphRef = useRef(null);
    const [data, setData] = useState();

    const fetchTweets = () => {

        fetch('/get_tweets',
            {
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify([])
            })
            .then((response) => response.json())
            .then((data) => {
                setData(data);
            })
            .catch((error) => console.error(error));
    };

    useEffect(() =>{
        if (!data){
            fetchTweets();
        }
    }, [data]);

    useEffect(() => {
        if (graphRef.current && data) {

            const counties = ['Sarasota', 'Manatee', 'Hillsborough', 'Pinellas', 'Pasco'];
            const locationArrays = {};

            counties.forEach((county) => {
                locationArrays[county] = [];
            });


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


            const dyData = [];


            Object.keys(locationArrays).forEach((location) => {
                Object.keys(locationArrays[location]).forEach((dateString) => {
                    const date = new Date(dateString);
                    const count = locationArrays[location][dateString];

                    dyData.push([date].concat(counties.map((county) => (county === location ? count : 0))));
                });
            });


            dyData.sort((a, b) => a[0] - b[0]);
            new Dygraph(
                graphRef.current,
                dyData,
                {
                    labels: ['Date'].concat(counties),
                    showRoller: false,
                    rollPeriod: 0,
                    width: 750,
                    height: 550,
                    colors: ['green', 'blue', 'red', 'orange', 'purple']
                }
            );
        }
    }, [data]);

    return <div ref={graphRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default TwitterTimeSeries;
