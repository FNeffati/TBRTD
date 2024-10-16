import React from "react";
import "../styling/faq.css";
import Header from "./Header";

const FAQ = () => {
    return (
        <div className="App">
            <Header />
            <div className="faqs">
                <section>
                    <h2>How to use the Dashboard</h2>
                    <p>
                        This dashboard contains a comprehensive summary of tweets obtained from Twitter/X from the
                        summer of 2018 to present, covering a period of intense red tide activity in 2018 and 2021
                        in the Tampa Bay region. The goal of the dashboard is to provide area resource managers
                        with insights into tweet behavior by displaying a record of all tweets during a specified
                        time period, summaries of most commonly used terms, how tweets vary by account type, where
                        tweets originate from, and how tweet volume has changed over time. This information can
                        inform how different types of Twitter/X users understand and respond to red tide events in
                        the Tampa Bay area. <a href={'https://doi.org/10.1016/j.hal.2021.102118'} target="_blank">Initial research</a> motivating the creation of this dashboard has
                        demonstrated a strong link between tweet activity and red tide bloom intensity.
                    </p>
                </section>

                <section>
                    <h2>Main Components</h2>
                    <h3>1) Filters to select tweets of interest</h3>
                    <p>
                        Results for all tweets in the database are shown when the dashboard is first loaded. These
                        include over 50,000 tweets that were obtained from Twitter using search terms descriptive
                        of red tide (e.g. “red tide”, “Karenia brevis”) relevant for a five-county area around
                        Tampa Bay (Hillsborough, Manatee, Pasco, Pinellas, and Sarasota Counties).
                    </p>
                    <p>
                        Users can filter the tweets to evaluate those of interest, including filters by date,
                        word cloud terms, county, account type, and retweets. By default, only original tweets 
						(no retweets) in the database are shown and the filters that include a categorical description 
						(word cloud, county, account type, retweets) will not show a checkmark by each category 
						indicating all are selected by default. Further filtering by categories will show a check mark 
						for one to any of the categories. Removing all checkmarks for a filter will default back to all.
                    </p>
                    <p>
                        The date range filter will select all tweets within the start and end date selected.
                        Clicking on the start or end date will show an additional menu where the user can further
                        refine their date search by year, month, and day.
                    </p>
                    <img src={require('../assets/Filters.png')} style={{width:'70%'}}/>
                    <h3>2) Graphical displays for the filtered tweets</h3>
                    <p>
                        The dashboard includes four graphical displays that present summaries of the selected
                        tweets. Each of these displays will respond to any changes made to the filters described
                        above. Please see the following.
                    </p>
                </section>

                <section>
                    <h2>Tweet Filters</h2>
                    <p>
                        The word cloud filter can be used to display commonly used terms in the tweets. The
                        filters distinguish terms that are hashtags or not and if the originating tweet was
                        geographically referenced. Hashtags are terms used to index or reference particular topics
                        on Twitter/X. Tweets that are geographically referenced include an explicit location
                        chosen by the user when the tweet is posted. Tweets that are not geographically referenced
                        were assigned to counties based on contextual information in the tweet. The terms are
                        grouped in the following categories:
                    </p>
					<ul>
                        <li>
                            <strong>Geo Hashtags:</strong> Hashtags that have to do with geographical areas (e.g.
                            #Tampa, #SiestaKey, etc)
                        </li>
                        <li>
                            <strong>Non Geo Hashtags:</strong> Hashtags that have to do with anything but the
                            geographical areas (e.g. #deadfish, #manatees).
                        </li>
                        <li>
                            <strong>Geo Single Terms:</strong> All the terms (not just the hashtags) that have to do
                            with geographical areas
                        </li>
                        <li>
                            <strong>Non Geo Single Terms:</strong> All the terms (not just the hashtags) that have
                            to do with anything but the geographical areas
                        </li>
                    </ul>
					<p>
                        The geographical areas mentioned in tweets can be using the county filter for any
                        of the five counties mentioned above. NOTE: Those indicate that the tweets were about the
                        county, not that they came from that county.
                    </p>
					<p>
                        The account type filter will select tweets for accounts assigned to one of five different
                        categories: academic, government, media, tourism, and other. Please see <a href={'https://journals.flvc.org/FLAIRS/article/view/135551'} target="_blank">this paper</a> for
                        additional information on how account types were assigned to each Twitter/X account in the
                        database.
                    </p>
					<p>
						Finally, the retweet filter will select original tweets or original tweets with retweets. 
						By default, only original tweets are shown.
					</p>
                </section>

                <section>
                    <h2>Graphical Displays</h2>
                    <h3>Tweet Scroller</h3>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <p style={{width:"50%", alignSelf: 'center'}}>
                            This shows each tweet that applies to the selected filters, including the username, tweet
                            text, date tweeted, county of origin, and the number of likes, retweets, and replies the
                            tweet received. All tweets that apply to the selected filters are shown by default and the
                            drop-down menus above the scroller can be used to further filter the tweets. Note that the
                            drop-down menus that filter tweets in the scroller do not affect the other graphical
                            displays.
                            <ul>
                                <li>
                                    First, the tweets can be filtered by selected words or phrases by typing them into the
                                    box above the scroller. These can include an exact match of a word (e.g., “dolphin”) or
                                    phrase (e.g., “fish kill”) or whether a tweet contains one or both of two separate terms
                                    (or phrases) using the “Contains” option from the left drop-down menu (e.g., contains
                                    “fish”, “kill”, or “fish kill”).
                                </li>
                                <li>
                                    The tweets in the scroller can also be filtered to include both original tweets and
                                    retweets or only original tweets using the top drop-down menu. A retweet is when a
                                    Twitter/X user “reposts” an original tweet from another user. Selecting only original
                                    tweets will reduce the total number of tweets in the scroller.
                                </li>
                                <li>
                                    Finally, the order of the tweets can be changed using the right drop-down menu. By
                                    default, the tweet scroller is arranged with date descending, where the most recent
                                    tweet is shown first. This option can be changed to show date ascending or to order the
                                    tweets by most liked, most retweeted, or most replies.
                                </li>
                            </ul>

                        </p>

                        <img src={require('../assets/scroller.png')} style={{width:"35%", alignSelf:'flex-end'}} alt={'Tweet Scroller'}/>
                    </div>
                    <p>
                        Only ten tweets are displayed at a time and the button on the bottom of the scroller can
                        be used to cycle through the tweets by advancing ten tweets at a time or by jumping to a
                        selected page.
                    </p>
                </section>

                <section>
                    <h3>Word Cloud</h3>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <img src={require('../assets/wordcloud.png')} style={{Width:"50%", alignSelf:'flex-start'}} alt={'Tweet Scroller'}/>
                        <p style={{width:"50%", alignSelf: 'center'}}>
                            The word cloud provides a graphical display of the frequency of hashtags or terms that are
                            included in the tweet selection. A hashtag or term that occurs with high frequency is
                            shown with a larger font. The number of tweets that include the hashtag or term is shown
                            by popup text when mousing over a word. Additionally, the tweet scroller can be filtered
                            to all tweets that contain the term or hashtag by clicking on a word in the word cloud.
                            This will autofill the text filter in the tweet scroller with the selected word.
                        </p>
                    </div>
					<p>
					There are <b>three types of word clouds</b> presented in this dashboard: <b>Single Term</b>, 
					<b>Single User</b>, and <b>Hashtag</b> Word Clouds. Each of these types can also be filtered 
					by non geo or geo-tagged tweets that do not or do include an explicit geographic location, 
					respectively.  Non geo-tagged tweets are assigned a location based on tweet content, rather 
					than an explicit tag.  The Single Term Word Clouds reflect how frequently a term (either 
					a hashtag or a regular word) has been mentioned. The Single User Word Clouds reflect how many 
					individual users mentioned that term, helping reduce the impact of spam and frequent retweeting 
					of the term by same users. The Hashtag Word Cloud reflects how frequently a hashtag has been 
					mentioned, disregarding any non-hashtag terms.
					</p>
                </section>

                <section>
                    <h3>Map</h3>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <p style={{width:"50%", alignSelf: 'center'}}>
                            The map provides a spatial summary of tweet volume by each of the five counties. The
                            counties are colored using a gradient from white to red, where the intensity of red
                            increases with more tweets. This can provide a quick visual summary of where tweet
                            activity is most intense for a selected time period and user account. Note that the county
                            filter will not change the map appearance as all counties are shown by default.
                        </p>
                        <img src={require('../assets/heatmap.png')} style={{width:"50%", alignSelf:'flex-start'}} alt={'Tweet Scroller'}/>
                    </div>
                </section>

                <section>
                    <h3>Time Series Plot</h3>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <img src={require('../assets/Timeseries.gif')} style={{width:"50%", alignSelf:'flex-start'}} alt={'Tweet Scroller'}/>
                        <p style={{width:"50%", alignSelf: 'center'}}>
                            The time series plot shows tweet volume by county over time. Mousing over the plot will
                            show a text summary of the number of tweets originating from each county on a given date.
                            The plot can also be zoomed by holding the left mouse button and dragging to a time period
                            or tweet volume range of interest. Double-clicking the map will reset the view. Note the
                            clear increase in tweet activity corresponding to peak red tides during 2018 and 2021.
							The time series plot can also be filtered to include tweets with specific words or
							phrases from the text entry box above the plot. Evaluating volume by county can also 
							suggest spatial changes in bloom impacts over time.
                        </p>
                    </div>
                </section>

                <section>
                    <h2>Attribution</h2>
                    <p>
                        This dashboard was a collaborative effort between New College of Florida and the Tampa Bay
                        Estuary Program with funding provided by the Tampa Bay Environmental Restoration Fund. We
                        sincerely thank our advisory committee for support and feedback during the development of
                        the dashboard. The advisory committee included representatives from Ecco Scientific,
                        Florida Department of Health, Florida Fish and Wildlife Conservation Commission, Mote
                        Marine Laboratory, Pinellas County, and University of Florida. Dashboard developers
                        included New College of Florida graduate students Fehmi Neffati, Melvin Adkins, and Seamus
                        Jackson under advisement of Dr. Andrey Skripnikov and Dr. Tania Roy.
                    </p>
                    <div className="image-container">
                        <img src={require('../assets/NCF.png')} alt={'New College of Florida'}/>
                        <img src={require('../assets/TBEP.png')} alt={'Tampa Bay Estuary Program'}/>
                    </div>
                </section>

                <section>
                    <h2>Contact Information</h2>
                    <p>
                        Please contact <a href={'askripnikov@ncf.edu'} target="_blank">Dr. Andrey Skripnikov</a>, <a href={"troy@ncf.edu"} target="_blank"> Dr. Tania Roy</a>, or <a href={"mbeck@tbep.org"} target="_blank">Dr. Marcus Beck</a> with questions or
                        comments regarding the dashboard.
                    </p>
                </section>

                <section>
                    <h2>Source Code</h2>
                    <p>
                        The dashboard was created using the open-source React framework written in JavaScript.
                        Source code is available on GitHub at{" "}
                        <a href="https://github.com/FNeffati/TBRTD" target="_blank" rel="noopener noreferrer">
                            GitHub Repository
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
};


export default FAQ;
