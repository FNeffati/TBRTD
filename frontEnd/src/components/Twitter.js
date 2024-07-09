import React, { useEffect, useState } from "react";
import "../styling/Twitter.css";
import ContentHeader from "./ContentHeader";
import defaultAvatar from '../assets/avatar.jpg';

function Twitter({ selectedFilters, onTweetsFetched, clickedWord }) {
    const [tweets, setTweets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const [filterMode, setFilterMode] = useState('exact');

    const formatDate = (dateObj) => {
        let isoDateString;
        if (typeof dateObj === 'object' && dateObj.hasOwnProperty('$date')) {
            isoDateString = dateObj['$date'];
        } else {
            isoDateString = dateObj;
        }

        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) {
            console.error("Invalid Date:", isoDateString);
            return "Invalid Date";
        }

        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const fetchTweets = () => {
        fetch('/get_tweets',
            {
                'method': 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedFilters)
            })
            .then((response) => response.json())
            .then((data) => {
                const tweetsSorted = data.sort((a, b) => {
                    const dateA = new Date(a.time.$date)
                    const dateB = new Date(b.time.$date)
                    return dateB - dateA;
                });
                setTweets(tweetsSorted);
                onTweetsFetched(data);
                setCurrentPage(1);
            })
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        fetchTweets();
    }, [selectedFilters]);

    const highlightText = (text, words) => {
        if (!words.length) return text;
        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    };

    const filteredTweets = tweets.filter((tweet) => {
        if (filterMode === 'exact') {
            return tweet.text && tweet.text.toLowerCase().includes(searchTerm1.toLowerCase());
        } else {
            if (!searchTerm1) return tweets;
            if (searchTerm1 !== '' || searchTerm2 !== '') {
                // return tweet.text && [searchTerm1, searchTerm2].every((term) =>
                //     tweet.text.toLowerCase().includes(term)
                // );
                if (searchTerm1 !== '' && searchTerm2 !== ''){
                    return tweet.text && (tweet.text.toLowerCase().includes(searchTerm1.toLowerCase()) || tweet.text.toLowerCase().includes(searchTerm2.toLowerCase()));
                }
                if (searchTerm1 !== ''){
                    return tweet.text && (tweet.text.toLowerCase().includes(searchTerm1.toLowerCase()));
                }
                if (searchTerm2 !== ''){
                    return tweet.text.toLowerCase().includes(searchTerm2.toLowerCase());
                }
            } else {
                return tweet.text && tweet.text.toLowerCase().includes(searchTerm1.toLowerCase());
            }
        }
    });

    const handleFilterChange = (event) => {
        setFilterMode(event.target.value);
    };

    useEffect(() => {
        if (filterMode === 'contains'){
            if(searchTerm1 === ''){
                setSearchTerm1(clickedWord);
            }

            else if(searchTerm2 === ''){
                setSearchTerm2(clickedWord)
            }
        }
        else if(filterMode === 'exact'){
            setSearchTerm1(clickedWord);
        }
        console.log(searchTerm1, searchTerm2)

    }, [clickedWord, searchTerm1, searchTerm2]);

    useEffect(() => {
        setSearchTerm1(searchTerm1);
        setSearchTerm2(searchTerm2)
    }, [searchTerm1, searchTerm2]);

    const handlePageChange = (event) => {
        const newPage = event.target.value === '' ? '' : Number(event.target.value);
        if (newPage === '' || (newPage >= 1 && newPage <= totalPages)) {
            setCurrentPage(newPage);
        }
    };

    const handleBlur = () => {
        if (currentPage === '') {
            setCurrentPage(1);
        }
    };

    const [tweetsPerPage] = useState(10);
    const indexOfLastTweet = currentPage * tweetsPerPage;
    const indexOfFirstTweet = indexOfLastTweet - tweetsPerPage;
    const currentTweets = filteredTweets.slice(indexOfFirstTweet, indexOfLastTweet);
    const totalPages = Math.ceil(filteredTweets.length / tweetsPerPage);

    return (
        <div className="twitter_container">
            <div className="tweets_info">      
            </div>
            <div className="tweets_header">
                <div className="search_bar_container">
                    {filterMode === 'exact' && (
                        <div>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="Filter tweets"
                                value={searchTerm1}
                                onChange={(e) => setSearchTerm1(e.target.value)}
                            />
                            {searchTerm1 && (
                                <button className="clear_button" onClick={() => setSearchTerm1('')}>
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                    {filterMode === 'contains' && (
                        <div>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="First word"
                                value={searchTerm1}
                                onChange={(e) => setSearchTerm1(e.target.value)}
                            />
                            {searchTerm1 && (
                                <button className="clear_button" onClick={() => setSearchTerm1('')}>
                                    Clear
                                </button>
                            )}

                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="Second word"
                                value={searchTerm2}
                                onChange={(e) => setSearchTerm2(e.target.value)}
                            />
                            {searchTerm2 && (
                                <button className="clear_button" onClick={() => setSearchTerm2('')}>
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                    <div className="dropdown_menu">
                        <select className="filter_dropdown" value={filterMode} onChange={handleFilterChange}>
                            <option value="exact">Exact Match</option>
                            <option value="contains">Contains</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="tweets_container">
                <ul>
                    {Array.isArray(currentTweets) && currentTweets.length > 0 ? (
                        currentTweets.map((tweet) => (
                            <div className="tweet" key={tweet.id}>
                                <div className="tweet_top">
                                    <img
                                        src={tweet.image || defaultAvatar}
                                        alt="Profile"
                                        className="profile_image"
                                    />
                                    <a className="username" target="_blank" rel="noopener noreferrer" href={"http://www.x.com/" + tweet.username}>@{tweet.username}</a>
                                </div>

                                <div className="tweet_mid">
                                    <p
                                        className="tweet_text"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightText(tweet.text, [searchTerm1, searchTerm2]),
                                        }}
                                    ></p>
                                </div>

                                <div className="tweet_bottom">
                                    <p className="tweet_time">{formatDate(tweet.time)}</p>
                                    <p className="tweet_location">{tweet.location}</p>
                                </div>

                                <hr className="divider"/>

                                <div className=" tweet_interactions">
                                    <p>Likes: {tweet.likes || 0}</p>
                                    <p>Retweets: {tweet.retweets | 0}</p>
                                    <p>Replies: {tweet.replies || 0}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="tweet_mid">
                            <p className="no_match">No Tweets match your filters.</p>
                        </div>
                    )}
                </ul>
            </div>
            <div className="pagination">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                    Next
                </button>
                <input
                    type="number"
                    value={currentPage}
                    onChange={handlePageChange}
                    onBlur={handleBlur}
                    min="1"
                    max={totalPages}
                />
            </div>
        </div>
    );
}

export default Twitter;
