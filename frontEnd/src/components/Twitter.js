import React, { useEffect, useState } from "react";
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
    const [filterMode, setFilterMode] = useState('exact');
    const [containsRetweets, setContainsRetweets] = useState(true);
    const [retweets, setRetweets] = useState("With Retweets");
    const [sortOrder, setSortOrder] = useState("Most Recent");

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
            } else if (sortOrder === "Most Retweets") {
                return (b.retweets || 0) - (a.retweets || 0);
            } else if (sortOrder === "Most Replies") {
                return (b.replies || 0) - (a.replies || 0);
            }
            return 1;
        });
    };

    /**
     * Fetches tweets from the server based on selected filters and retweets setting.
     */
    const fetchTweets = () => {
        fetch('/get_tweets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([selectedFilters, { "retweets": containsRetweets }])
        })
            .then((response) => response.json())
            .then((data) => {
                const sortedData = sortTweets(data);  // Sort the data immediately after fetching
                setTweets(sortedData);
                onTweetsFetched(sortedData);
                setCurrentPage(1);
            })
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        fetchTweets();
    }, [selectedFilters, containsRetweets]);

    useEffect(() => {
        setTweets(prevTweets => sortTweets(prevTweets));
    }, [sortOrder]);

    /**
     * Highlights the specified words in the text.
     *
     * @param {string} text - The text to highlight.
     * @param {Array<string>} words - The words to highlight.
     * @returns {string} The text with highlighted words.
     */
    const highlightText = (text, words) => {
        if (!words.length) return text;

        const regex = new RegExp(words.filter(word => word !== '').join('|'), 'gi');
        return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    };

    const filteredTweets = tweets.filter((tweet) => {
        if (filterMode === 'exact') {
            return tweet.text && tweet.text.toLowerCase().includes(searchTerm1.toLowerCase());
        } else {
            if (searchTerm1 !== '' || searchTerm2 !== '') {
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
        return true;
    });

    /**
     * Handles the change of filter mode (exact or contains).
     *
     * @param {Event} event - The change event.
     */
    const handleFilterChange = (event) => {
        setFilterMode(event.target.value);
    };

    /**
     * Handles the change of retweets setting.
     *
     * @param {Event} event - The change event.
     */
    const handleContainRetweetsChange = (event) => {
        if(event.target.value === "With Retweets"){
            setRetweets('With Retweets');
            setContainsRetweets(true);
        }
        else if(event.target.value === "Without Retweets"){
            setRetweets('Without Retweets');
            setContainsRetweets(false);
        }
    };

    /**
     * Handles the change of sort order.
     *
     * @param {Event} event - The change event.
     */
    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    };

    useEffect(() => {
        if (filterMode === 'contains'){
            if(searchTerm1 === ''){
                setSearchTerm1(clickedWord);
            }
            else if(searchTerm2 === ''){
                setSearchTerm2(clickedWord);
            }
        }
        else if(filterMode === 'exact'){
            setSearchTerm1(clickedWord);
        }
        console.log(searchTerm1, searchTerm2)

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


    /**
     * Sanitizes and highlights the specified terms in the text.
     *
     * @param {string} text - The text to sanitize and highlight.
     * @param {Array<string>} terms - The terms to highlight.
     * @returns {string} The sanitized and highlighted text.
     */
    const sanitizeAndHighlightText = (text, terms) => {
        let sanitizedText = linkify(text);
        terms.forEach(term => {
            if (term) {
                const regex = new RegExp(`(${term})`, 'gi');
                sanitizedText = sanitizedText.replace(regex, `<mark>$1</mark>`);
            }
        });
        return DOMPurify.sanitize(sanitizedText, { ADD_ATTR: ['target'] });
    };

    return (
        <div className="twitter_container">
            <div className="tweets_info"></div>
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
                        <select className="containRetweets" value={retweets} onChange={handleContainRetweetsChange}>
                            <option value="With Retweets">With Retweets</option>
                            <option value="Without Retweets">Without Retweets</option>
                        </select>

                        <select className="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="Most Recent">Most Recent</option>
                            <option value="Least Recent">Least Recent</option>
                            <option value="Most Likes">Most Liked</option>
                            <option value="Most Retweets">Most Retweets</option>
                            <option value="Most Replies">Most Replies</option>
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