import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer, GeoJSON, Marker} from 'react-leaflet';
import floridaCounties from './geojson-fl-counties-fips.json';
import "../styling/FloridaMap.css";
import L from 'leaflet';

/*
Citations:
GeoJSON source: https://github.com/danielcs88/fl_geo_json
Leaflet: https://react-leaflet.js.org
*/


/**
 * FloridaMap component renders a map of Florida with counties and tweet counts.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.date - The date for which to fetch tweet counts.
 * @param {Array<string>} props.account_types - The account types for which to fetch tweet counts.
 */
const FloridaMap = ({ date, account_types, retweetFilter }) => {

    const [tweetCounts, setTweetCounts] = useState({})

    /**
     * Fetches tweet counts for the specified date and account types.
     */
    const fetchCounts = () => {
        const retweetsIncluded = retweetFilter === 'With Retweets';
        fetch('/get_counts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date,
                account_types,
                retweets: retweetsIncluded
            })
        })
            .then((response) => response.json())
            .then((data) => {
                setTweetCounts(data.counts || {});
            })
            .catch((error) => {
                console.error("Failed to fetch tweet counts:", error);
            });
    };

    useEffect(() => {
        fetchCounts();
    }, [date, account_types, retweetFilter]);

    /**
     * Normalizes tweet counts to a range of 0 to 1 based on the maximum count.
     *
     * @param {Object} tweetCounts - The tweet counts by county.
     * @returns {Object} The normalized tweet counts.
     */

    const normalizeTweetCounts = (tweetCounts) => {
        const maxCount = Math.max(...Object.values(tweetCounts));
        const normalizedCounts = {};

        for (const county in tweetCounts) {
            normalizedCounts[county] = tweetCounts[county] / maxCount;
        }

        return normalizedCounts;
    };

    const normalizedTweetCounts = normalizeTweetCounts(tweetCounts);
    const colorMap = {
        'Manatee': 'blue',
        'Sarasota': 'green',
        'Hillsborough': 'red',
        'Pinellas': 'orange',
        'Pasco': 'purple'
    };

    const rgbMap = {
        'blue': [0, 0, 255],
        'green': [0, 128, 0],
        'red': [255, 0, 0],
        'orange': [255, 165, 0],
        'purple': [128, 0, 128]
    };

    /**
     * Determines the fill color for a county based on tweet count intensity.
     *
     * @param {string} countyName - The name of the county.
     * @param {number} normalizedCount - The normalized tweet count for the county.
     * @returns {string} The RGB color string for the county.
     */
    const getColor = (countyName, normalizedCount) => {
        /*
        const color = colorMap[countyName] || 'black';
        const [r, g, b] = rgbMap[color];

        const intensity = Math.round(255 * normalizedCount);
        const adjustedR = Math.min(r, r + intensity);
        const adjustedG = Math.min(g, g + intensity);
        const adjustedB = Math.min(b, b + intensity);

        return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
        // return `rgb(${r}, ${g}, ${b})`;
        */

        const intensity = Math.round(255 * normalizedCount);
        return `rgb(${255}, ${255 - intensity}, ${255 - intensity})`;
    };

    /**
     * Defines the style for each county on the map.
     *
     * @param {Object} feature - The GeoJSON feature for the county.
     * @returns {Object} The style object for the county.
     */
    const style = (feature) => {
        const countyName = feature.properties.NAME;
        const tweetCount = normalizedTweetCounts[countyName] || 0;
        const fillColor = getColor(countyName, tweetCount);

        return {
            fillColor: fillColor,
            fillOpacity: 0.5,
            color: 'white',
            weight: 5,
        };
    };
    const [hoverInfo, setHoverInfo] = useState({ show: false, county: '', x: 0, y: 0 });

    /**
     * Adds mouseover and mouseout event listeners to each county layer.
     *
     * @param {Object} county - The GeoJSON feature for the county.
     * @param {Object} layer - The leaflet layer for the county.
     */
    const onEachFeature = (county, layer) => {
        layer.on('mouseover', function (e) {
            const mapContainerRect = document.querySelector('.map_div').getBoundingClientRect();
            const x = e.originalEvent.clientX - mapContainerRect.left;
            const y = e.originalEvent.clientY - mapContainerRect.top;
            setHoverInfo({ show: true, county: county.properties.NAME, x: x, y: y });
        });

        layer.on('mouseout', function () {
            setHoverInfo({ show: false, county: '', x: 0, y: 0 });
        });
    };


    const countyMarkers = floridaCounties.features.map((feature, index) => {
        const countyName = feature.properties.NAME;
        const coordinates = feature.geometry.coordinates[0];
        const centroid = calculateCentroid(coordinates);

        return (
            <Marker
                key={index}
                position={[centroid[0], centroid[1]]}
                icon={L.divIcon({
                    className: 'county-label',
                    html: `<div>${countyName}</div>`
                })}
            />
        );
    });

    return (
        <div className="map_div">
            <MapContainer center={[27.766279, -82.686783]} zoom={8} style={{ height: 400, width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON
                    data={floridaCounties}
                    style={style}
                    onEachFeature={onEachFeature}
                />
                {countyMarkers}
            </MapContainer>
            {hoverInfo.show && (
                <div
                    className="map-hover-popup"
                    style={{ left: hoverInfo.x+1100, top: hoverInfo.y+400 }}
                >
                    {hoverInfo.county} - Tweets: {tweetCounts[hoverInfo.county] || 0}
                </div>
            )}
        </div>
    );
};

/**
 * Calculates the centroid of a set of coordinates.
 *
 * @param {Array} coordinates - The array of coordinates.
 * @returns {Array<number>} The centroid of the coordinates.
 */
const calculateCentroid = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
        return [0, 0];
    }

    let centroid = [0, 0];
    const numPoints = coordinates.length;

    for (let i = 0; i < numPoints; i++) {
        if (!coordinates[i] || !Array.isArray(coordinates[i]) || coordinates[i].length !== 2) {
            continue;
        }

        centroid[0] += coordinates[i][1]; // Latitude
        centroid[1] += coordinates[i][0]; // Longitude
    }

    centroid[0] /= numPoints;
    centroid[1] /= numPoints;

    return centroid;
};




export default FloridaMap;
