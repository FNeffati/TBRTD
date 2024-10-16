import React, { useEffect, useState, useRef } from "react";
import "../styling/Twitter.css";
import defaultAvatar from '../assets/avatar.jpg';
import DOMPurify from 'dompurify';

/**
 * Twitter component fetches and displays tweets based on selected filters and search terms.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array<string>} props.selectedFilters - The selected filters to fetch tweets.
 * @param {Function} props.onTweetsFetched - Callback function to handle fetched tweets.
 * @param {string} props.clickedWord - The clicked word to be used for filtering tweets.
 */
function Twitter({ selectedFilters, onTweetsFetched, clickedWord }) {
    const [tweets, setTweets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const [filterMode, setFilterMode] = useState('Exact Phrase');
    const [sortOrder, setSortOrder] = useState("Most Recent");

    // Cache to store fetched data
    const cache = useRef(new Map());

    /**
     * Formats the date object to a readable string.
     *
     * @param {Object} dateObj - The date object to format.
     * @returns {string} The formatted date string.
     */
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

        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Sorts tweets based on the selected sort order.
     *
     * @param {Array<Object>} tweetsToSort - The array of tweets to sort.
     * @returns {Array<Object>} The sorted array of tweets.
     */
    const sortTweets = (tweetsToSort) => {
        return [...tweetsToSort].sort((a, b) => {
            if (sortOrder === "Most Recent" || sortOrder === "Least Recent") {
                const dateA = new Date(a.time.$date);
                const dateB = new Date(b.time.$date);
                return sortOrder === "Most Recent" ? dateB - dateA : dateA - dateB;
            } else if (sortOrder === "Most Likes") {
                return (b.likes || 0) - (a.likes || 0);
            }
            else if (sortOrder === "Most Retweeted") {
                return (b.retweets || 0) - (a.retweets || 0);
            }
            return 1;
        });
    };

    /**
     * Generates a cache key based on the selected filters.
     *
     * @param {Object} filters - The selected filters.
     * @returns {string} The generated cache key.
     */
    const generateCacheKey = (filters) => {
        return JSON.stringify(filters);
    };

    /**
     * Fetches tweets from the server based on selected filters and retweets setting.
     */
    const fetchTweets = () => {
        const containsRetweets = selectedFilters.retweetFilter[0] === "With Retweets"; 
        const cacheKey = generateCacheKey({ ...selectedFilters, retweets: containsRetweets });

        // Check if data is in cache
        if (cache.current.has(cacheKey)) {
            // Use cached data
            const cachedData = cache.current.get(cacheKey);
            setTweets(cachedData);
            onTweetsFetched(cachedData);
            setCurrentPage(1);
        } else {
            // Fetch new data if not in cache
            fetch('/get_tweets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([selectedFilters, { "retweets": containsRetweets }])
            })
            .then((response) => response.json())
            .then((data) => {
                const sortedData = sortTweets(data);
                setTweets(sortedData);
                onTweetsFetched(sortedData);
                setCurrentPage(1);
                // Store data in cache
                cache.current.set(cacheKey, sortedData);
            })
            .catch((error) => console.error("Error fetching tweets:", error));
        }
    };

    useEffect(() => {
        fetchTweets();
    }, [selectedFilters, selectedFilters.retweetFilter]);

    useEffect(() => {
        setTweets(prevTweets => sortTweets(prevTweets));
    }, [sortOrder]);

    /**
     * Escapes special characters in a string for use in a regular expression.
     * @param {string} string - The string to escape.
     * @returns {string} The escaped string.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping}
     */ 
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Filters tweets based on the search terms and filter mode.
     * @param {Array<Object>} tweets - The array of tweets to filter.
     * @returns {Array<Object>} The filtered array of tweets.
     */
    const filteredTweets = tweets.filter((tweet) => {
        if (!searchTerm1 && !searchTerm2) {
            return true;
        }
    
        const term1 = escapeRegExp(searchTerm1.trim());
        const term2 = escapeRegExp(searchTerm2.trim());
    
        // Updated regex patterns for exact word matching
        const regex1 = new RegExp(`(^|\\s)${term1}($|\\s)`, 'i');
        const regex2 = new RegExp(`(^|\\s)${term2}($|\\s)`, 'i');
    
        if (filterMode === 'Exact Phrase') {
            return tweet.text && regex1.test(tweet.text);
        } else if (filterMode === 'Contains Either') {
            return tweet.text && (regex1.test(tweet.text) || regex2.test(tweet.text));
        } else if (filterMode === 'Contains Both') {
            return tweet.text && regex1.test(tweet.text) && regex2.test(tweet.text);
        }
        return true;
    });

    /**
     * Sanitizes and highlights the text based on the search terms.
     * @param {string} text - The text to sanitize and highlight.
     * @param {Array<string>} terms - The search terms to highlight.
     * @returns {string} The sanitized and highlighted text.
     */
    const sanitizeAndHighlightText = (text, terms) => {
        let sanitizedText = linkify(text);
        terms.forEach(term => {
            if (term) {
                const escapedTerm = escapeRegExp(term.trim());
                // Updated regex pattern for exact word highlighting
                const regex = new RegExp(`(^|\\s)(${escapedTerm})($|\\s)`, 'gi');
                sanitizedText = sanitizedText.replace(regex, (match, p1, p2, p3) => {
                    return `${p1}<mark>${p2}</mark>${p3}`;
                });
            }
        });
        return DOMPurify.sanitize(sanitizedText, { ADD_ATTR: ['target'] });
    };

    /**
     * Handles the change of filter mode (exact or contains).
     *
     * @param {Event} event - The change event.
     */
    const handleFilterChange = (event) => {
        setFilterMode(event.target.value);
    };
    
    useEffect(() => {
        if ((filterMode === 'Contains Both') || (filterMode ==='Contains Either')){
            if(searchTerm1 === ''){
                setSearchTerm1(clickedWord);
            }
            else if(searchTerm2 === ''){
                setSearchTerm2(clickedWord);
            }
        }
        else if(filterMode === 'Exact Phrase'){
            setSearchTerm1(clickedWord);
        }
    }, [filterMode, clickedWord, searchTerm1, searchTerm2]);


    useEffect(() => {
        setSearchTerm1(searchTerm1);
        setSearchTerm2(searchTerm2);
    }, [searchTerm1, searchTerm2]);

    /**
     * Handles the change of the current page.
     *
     * @param {Event} event - The change event.
     */
    const handlePageChange = (event) => {
        const newPage = event.target.value === '' ? '' : Number(event.target.value);
        if (newPage === '' || (newPage >= 1 && newPage <= totalPages)) {
            setCurrentPage(newPage);
        }
    };

    /**
     * Handles the blur event of the page input to reset to 1 if empty.
     */
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

    /**
     * Converts URLs in the text to clickable links.
     *
     * @param {string} text - The text to linkify.
     * @returns {string} The text with clickable links.
     */
    const linkify = (text) => {
        const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
        return text.replace(urlPattern, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    };

    return (
        <div className="twitter_container">
            <div className="tweets_info"></div>
            <div className="tweets_header">
                <div className="search_bar_container">
                    {filterMode === 'Exact Phrase' && (
                        <div>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="Begin typing to filter tweet results."
                                value={searchTerm1}
                                onChange={(e) => setSearchTerm1(e.target.value)}
                            />
                                <button className="clear_button" onClick={() => setSearchTerm1('')}>
                                    Clear
                                </button>
                        </div>
                    )}
                    {filterMode === 'Contains Either'  && (
                        <div>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="First word"
                                value={searchTerm1}
                                onChange={(e) => setSearchTerm1(e.target.value)}
                            />
                                <button className="clear_button" onClick={() => setSearchTerm1('')}>
                                    Clear
                                </button>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="Second word"
                                value={searchTerm2}
                                onChange={(e) => setSearchTerm2(e.target.value)}
                            />
                                <button className="clear_button" onClick={() => setSearchTerm2('')}>
                                    Clear
                                </button>
                        </div>
                    )}
                    {filterMode === 'Contains Both'  && (
                        <div>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="First word"
                                value={searchTerm1}
                                onChange={(e) => setSearchTerm1(e.target.value)}
                            />
                                <button className="clear_button" onClick={() => setSearchTerm1('')}>
                                    Clear
                                </button>
                            <input
                                className="tweet_search_bar"
                                type="text"
                                placeholder="Second word"
                                value={searchTerm2}
                                onChange={(e) => setSearchTerm2(e.target.value)}
                            />
                                <button className="clear_button" onClick={() => setSearchTerm2('')}>
                                    Clear
                                </button>
                        </div>
                    )}
                    <div className="dropdown_menu">
                        <select className="filter_dropdown" value={filterMode} onChange={handleFilterChange}>
                            <option value="Exact Phrase">Exact Phrase</option>
                            <option value="Contains Either">Contains Either</option>
                            <option value="Contains Both">Contains Both</option>
                        </select>

                        <select className="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="Most Recent">Most Recent</option>
                            <option value="Least Recent">Least Recent</option>
                            <option value="Most Likes">Most Liked</option>
                            <option value="Most Retweeted">Most Retweeted</option>
                            <option value="Most Replies">Most Replies</option>
                        </select>
                    </div>
                </div>
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
                                            __html: sanitizeAndHighlightText(tweet.text, [searchTerm1, searchTerm2]),
                                        }}
                                    ></p>
                                </div>
                                <div className="tweet_bottom">
                                    <p className="tweet_time">{formatDate(tweet.time)}</p>
                                    <p className="tweet_location">{tweet.location}</p>
                                </div>
                                <hr className="divider"/>
                                <div className="tweet_interactions">
                                    <p>Likes: {tweet.likes || 0}</p>
                                    <p>Retweets: {tweet.retweets || 0}</p>
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
            </div>
        </div>
    );
}

export default Twitter;