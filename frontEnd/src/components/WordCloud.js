import React, { useEffect, useMemo, useState } from "react";
import ReactWordcloud from "react-wordcloud";
import "../styling/WordCloud.css";
import 'tippy.js/dist/tippy.css';
import Util from './analysis';

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

    useEffect(() => {
        if (tweets.length > 0) {
            if (cloud_type.length === 0 || cloud_type[0] === 'Non Geo Single Terms') {
                const top100Words = Util.nonGeoRegularTermWordCloud(tweets);
                setWords(top100Words);
            } else if (cloud_type[0] === "Geo Single Terms") {
                const hashtags = Util.geoRegularTermWordCloud(tweets);
                setWords(hashtags);
            } else if (cloud_type[0] === "Geo Hashtags") {
                const hashtags = Util.geohashtagsCloud(tweets);
                setWords(hashtags);
            } else if (cloud_type[0] === "Non-Geo Hashtags") {
                const hashtags = Util.nonGeohashtagsCloud(tweets);
                setWords(hashtags);
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
        []
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
