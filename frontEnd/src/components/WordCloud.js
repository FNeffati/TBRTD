import React, {useEffect, useMemo, useState} from "react";
import ReactWordcloud from "react-wordcloud";
import 'tippy.js/dist/tippy.css';
import Util from './analysis';


const WordCloud = ({ cloud_type, tweets, onWordCloudClick}) => {

    const [words, setWords] = useState([{
        text: "LOADING",
        value: 20
    }]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (tweets.length > 0) {
            if (cloud_type.length === 0 || cloud_type[0] === 'Single Term Cloud') {
                const top100Words = Util.regularWordCloud(tweets);
                setWords(top100Words);
            } else if (cloud_type[0] === "Geo Hashtags") {
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
            colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
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
            onWordClick: (word) => onWordCloudClick('#'+word.text)
        }),
        []
    );

    const size = useMemo(() => [500, 600], []);

    return (
        <div className="word-cloud-container">
            <div className="loading">{loading && <p>Loading...</p>}</div>
            <div className="word-cloud">
                <ReactWordcloud  words={words} options={options} size={size} padding={0} callbacks={callbacks}/>
            </div>
        </div>
    );
};

export default WordCloud;