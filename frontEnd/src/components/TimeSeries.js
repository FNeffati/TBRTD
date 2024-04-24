import React, {useEffect, useRef, useState} from 'react';
import Dygraph from 'dygraphs';
import "../styling/TimeSeries.css"

const TwitterTimeSeries = () => {
    const graphRef = useRef(null);

    const [data, setData] = useState()

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
            fetchTweets()
        }
    },[data])

    useEffect(() => {
        if (graphRef.current && data) {
            const tweetCounts = {};
            data.forEach((tweet) => {
                const date = new Date(tweet.time.$date);
                const dateString = date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
                if (!tweetCounts[dateString]) {
                    tweetCounts[dateString] = 0;
                }
                tweetCounts[dateString]++;
            });

            const dyData = Object.entries(tweetCounts).map(([date, count]) => ({ date: new Date(date), count }));

            dyData.sort((a, b) => a.date - b.date);

            const formattedData = dyData.map(({ date, count }) => [date, count]);

            new Dygraph(graphRef.current, formattedData, {
                labels: ['Date', 'Tweet Count'],
                showRoller: false,
                rollPeriod: 0,
                width: 650,
                height: 550
            });
        }
    }, [data]);



    return <div ref={graphRef} style={{width:'100%', height:'100%'}}></div>;

};

export default TwitterTimeSeries;
