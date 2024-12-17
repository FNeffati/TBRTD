import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactWordcloud from "react-wordcloud";
import "../styling/WordCloud.css";
import 'tippy.js/dist/tippy.css';
import Util from './analysis';

/*
React Word Cloud Package: https://www.npmjs.com/package/react-wordcloud
 */

/**
 * WordCloud component renders a word cloud based on the provided tweets and cloud type.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.cloud_type - The type of word cloud to display.
 * @param {Array<Object>} props.tweets - The tweets data to generate the word cloud from.
 * @param {Function} props.onWordCloudClick - Callback function to handle word clicks in the word cloud.
 */
const WordCloud = ({ cloud_type, tweets, onWordCloudClick }) => {
    const [words, setWords] = useState([{ text: "LOADING", value: 20 }]);

    // Cache to store word clouds
    const cache = useRef({});

    useEffect(() => {
        if (tweets.length > 0) {
            // Create a unique key for caching based on cloud_type and tweets
            const cacheKey = JSON.stringify({ cloud_type, tweets: tweets.map(tweet => tweet.id).join('-') });

            // Check if the data is already in cache
            if (cache.current[cacheKey]) {
                setWords(cache.current[cacheKey]);
            } else {
                // Generate the word cloud based on the cloud_type
                try {
                    let wordCloudData = [];
                    if (cloud_type.length === 0 || cloud_type[0] === 'Non Geo Single Terms') {
                        wordCloudData = Util.nonGeoRegularTermWordCloud(tweets);
                    }
                    else if (cloud_type[0] === "Geo Single Terms") {
                        wordCloudData = Util.geoRegularTermWordCloud(tweets);
                    }
                    else if (cloud_type[0] === "Geo Hashtags") {
                        wordCloudData = Util.geohashtagsCloud(tweets);
                    }
                    else if (cloud_type[0] === "Non-Geo Hashtags") {
                        wordCloudData = Util.nonGeohashtagsCloud(tweets);
                    }
                    else if (cloud_type[0] === "Geo Single User") {
                        wordCloudData = Util.geoSingleUserWordCloud(tweets);
                    }
                    else if (cloud_type[0] === "Non-Geo Single User") {
                        wordCloudData = Util.nonGeoSingleUserWordCloud(tweets);
                    }
                    
                    // Store generated data in cache
                    cache.current[cacheKey] = wordCloudData;
                    setWords(wordCloudData);
                } catch (error) {
                    console.error("Error generating word cloud:", error);
                    setWords([{ text: "Error generating cloud", value: 20 }]);
                }
            }
        } else {
            setWords([{ text: "LOADING", value: 20 }]);
        }
    }, [tweets, cloud_type]);

    const options = useMemo(
        () => ({
            rotations: 1,
            rotationAngles: [0],
            fontSizes: [15, 60],
            colors: ["#163b54"],
            enableTooltip: true,
            deterministic: true,
            fontFamily: "impact",
            fontStyle: "normal",
            fontWeight: "normal",
            padding: 1,
            scale: "sqrt",
            spiral: "archimedean",
            transitionDuration: 1000,
        }),
        []
    );

    const callbacks = useMemo(
        () => ({
            onWordClick: (word) => onWordCloudClick(word.text)
        }),
        [onWordCloudClick]
    );

    const size = useMemo(() => [500, 600], []);

    return (
        <div className="word-cloud-container">
            <div className="word-cloud-info"></div>
            <div className="word-cloud">
                <ReactWordcloud words={words} options={options} size={size} padding={0} callbacks={callbacks} />
            </div>
        </div>
    );
};

export default WordCloud;