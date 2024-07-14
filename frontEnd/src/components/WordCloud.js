import React, {useEffect, useMemo, useState} from "react";
import ReactWordcloud from "react-wordcloud";
import "../styling/WordCloud.css";
import 'tippy.js/dist/tippy.css';
import Util from './analysis';
import ContentHeader from "./ContentHeader";


const WordCloud = ({ cloud_type, tweets, onWordCloudClick}) => {

    const [words, setWords] = useState([{
        text: "LOADING",
        value: 20
    }]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (tweets.length > 0) {
            if (cloud_type.length === 0 || cloud_type[0] === 'Non Geo Single Terms') {
                const top100Words = Util.nonGeoRegularTermWordCloud(tweets);
                setWords(top100Words);
            }
            else if (cloud_type[0] === "Geo Single Terms") {
                const hashtags = Util.geoRegularTermWordCloud(tweets);
                setWords(hashtags);
            }
            else if (cloud_type[0] === "Geo Hashtags") {
                const hashtags = Util.geohashtagsCloud(tweets);
                setWords(hashtags);
            }
            else if (cloud_type[0] === "Non-Geo Hashtags") {
                const hashtags = Util.nonGeohashtagsCloud(tweets);
                setWords(hashtags);
            }
        } else {
            setWords([{
                text: "LOADING",
                value: 20
            }]);
        }
    }, [tweets, cloud_type]);


    const options = useMemo(
        () => ({
            rotations: 1,
            rotationAngles: [0],
            fontSizes: [15, 60],
            colors: ["#61baff"],
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
            <div className="loading">{loading && <p>Loading...</p>}</div>
            <div className="word-cloud-info">
            </div>
            <div className="word-cloud">
                <ReactWordcloud  words={words} options={options} size={size} padding={0} callbacks={callbacks}/>
            </div>
        </div>
    );
};

export default WordCloud;