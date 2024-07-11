import React, {useEffect, useState} from 'react';
import {MapContainer, TileLayer, GeoJSON, Marker} from 'react-leaflet';
import floridaCounties from './geojson-fl-counties-fips.json';
import "../styling/FloridaMap.css";
import L from 'leaflet';

const FloridaMap = ({ date, account_types }) => {

    const [tweetCounts, setTweetCounts] = useState(0)
    const fetchCounts = () => {
        fetch('/get_counts',
            {
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify([date, account_types])
            })
            .then((response) => response.json())
            .then((data) => {
                setTweetCounts(data.counts)
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetchCounts();
    }, [date, account_types]);


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

    const getColor = (countyName, normalizedCount) => {
        const color = colorMap[countyName] || 'black';
        const [r, g, b] = rgbMap[color];

        const intensity = Math.round(255 * normalizedCount);
        const adjustedR = Math.min(r, r + intensity);
        const adjustedG = Math.min(g, g + intensity);
        const adjustedB = Math.min(b, b + intensity);

        return `rgb(${adjustedR}, ${adjustedG}, ${adjustedB})`;
        // return `rgb(${r}, ${g}, ${b})`;
    };

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
                    style={{ left: hoverInfo.x+900, top: hoverInfo.y+200 }}
                >
                    {hoverInfo.county} - Tweets: {tweetCounts[hoverInfo.county] || 0}
                </div>
            )}
        </div>
    );
};

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
