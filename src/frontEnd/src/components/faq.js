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
                        Results for all tweets in the database are shown when the dashboard is first loaded.
                        These include over 63,000 tweets that were obtained from Twitter using search terms 
                        descriptive of red tide (e.g. “red tide”, “Karenia brevis”) relevant for a five-county area
                        around Tampa Bay (Hillsborough, Manatee, Pasco, Pinellas, and Sarasota Counties).
                        Users can filter the tweets, accounts and metrics to obtain the insights of interest.
                        Those filters include:  
                    </p>
                    <img className="filterPic" src={require('../assets/Filters.png')} style={{width:'95%'}}/>
                    <p>
                        <li>
                            <strong className="headerText" >Time Frame:</strong> Specifying the date range when tweets occurred. It defaults to the entire time span covered by the project (2018 - Oct 2024). 
                            <strong> NOTE:</strong> it doesn’t allow for typing the numbers in, hence one needs to use the point-and-click approach to pick the date.
                        </li>

                        
                        <li>
                            <strong className="headerText" >Word Cloud Type:</strong> The type of information to be displayed on the word cloud. It defaults to showing frequency of mentions 
                            for single words that are not referring to a geographical location (e.g. Tampa, Pinellas, etc), or “non-geo” terms as we’ll be calling them.
                            See “Graphical Displays” - “Word Clouds” section below for more details.
                        </li>
                        
                        <li>
                            <strong className="headerText" >County:</strong> The county that was mentioned in the tweet. Defaults to all five counties being selected 
                            (Hillsborough, Manatee, Pasco, Pinellas, Sarasota), but allows users to pick just one, or a subset of those. 
                            <span className="warningText"><strong> NOTE:</strong> Picking a certain county would result in filtering for tweets that were about that county, not tweets originating from that county.</span>
                        </li>
                        

                        <li>
                            <strong className="headerText" >Account Type:</strong> Selecting a particular account type (one of the following: academic, government, media, tourism, other) 
                            will filter for tweets that came only from user accounts of that type. Defaults to all five account types being included, 
                            but allows users to pick just one, or a subset of those. Please see <a href={'https://journals.flvc.org/FLAIRS/article/view/135551'} target="_blank">this paper</a> for additional information on how account 
                            types were assigned to each Twitter/X account in the database. 
                            <strong> NOTE:</strong> “Other” indicates predominantly regular citizens, hence might be of utmost interest in case
                            one wants to study the general public’s tweets.
                        </li>

                        <li>
                            <strong className="headerText" >With/Without Retweets:</strong> Whether to include retweets, or exclude them and focus on original posts and replies. 
                            By default, the retweets are excluded, hence only original tweets in the database are shown.
                        </li>
                    </p>
                    <h3>2) Graphical displays for the filtered tweets</h3>
                    <p>
                        The dashboard includes four graphical displays that present summaries of the selected tweets: Tweet Scroller, Word Cloud, Heatmap,
                        Time Series. For detailed description of each, see the “Graphical Displays” section below.
                    </p>
                </section>

                <section>
                    <h3>Graphical Displays</h3>
                    <h2 className="titleText">Tweet Scroller</h2>
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
                                    tweets by most liked, most retweeted, or most replies. The buttons above and below the 
                                    scroller can be used to navigate through the pages of tweets. Alternativley the user can
                                    put in a desired page number to jump to those results. 
                                </li>
                            </ul>

                        </p>

                        <img src={require('../assets/scroller.png')} style={{width:"35%", alignSelf:'flex-end'}} alt={'Tweet Scroller'}/>
                    </div>
                </section>

                <section>
                    <h2 className="titleText">Word Cloud</h2>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <img src={require('../assets/wordcloud.png')} style={{Width:"50%", alignSelf:'flex-start'}} alt={'Tweet Scroller'}/>
                        <p style={{width:"50%", alignSelf: 'center'}}>
                            The word cloud provides a graphical display of the frequency of hashtags or terms that are
                            included in the tweet selection. A hashtag or term that occurs with high frequency is
                            shown with a larger font. The number of tweets that include the hashtag or term is shown
                            by popup text when mousing over a word. Additionally, the tweet scroller can be filtered
                            to all tweets that contain the term or hashtag by clicking on a word in the word cloud.
                            This will autofill the text filter in the tweet scroller with the selected word.
                        
                            <li>
                                <strong>NOTE:</strong> By clicking on a word in the word cloud, the tweet scroller will be 
                                filtered to all tweets that contain that word. This will autofill the text filter in the
                                tweet scroller with the selected word/hashtag.

                            </li>
                            <li>
                                <strong>NOTE:</strong> There is also a list of “stopwords” that were removed from consideration
                                 by the word clouds, which mostly include frequently occurring words that don’t convey as much 
                                 information by themselves (e.g. articles, pronouns, etc).
                            </li>
                            <li>
                                <strong>NOTE:</strong> Word cloud responds to all five filters described in the “Main Components” 
                                section (Time Frame, Word Cloud Type, County, Account Type, With/Without Retweets).
                            </li>
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="titleText">Map</h2>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <p style={{width:"50%", alignSelf: 'center'}}>
                            The map provides a spatial summary of tweet volume by each of the five counties. The
                            counties are colored using a gradient from white to red, where the intensity of red
                            increases with more tweets. Note that the county
                            filter will not change the map appearance as all counties are shown by default.

                            <li>
                                <span className="warningText"><strong>NOTE:</strong> The counts that pop up upon hovering over a certain county represent the number of 
                                filtered tweets that were about that county, not tweets originating from that county.
                                </span>
                            </li>
                        </p>
                        <img src={require('../assets/heatmap.png')} style={{width:"50%", alignSelf:'flex-start'}} alt={'Tweet Scroller'}/>
                    </div>
                </section>

                <section>
                    <h2 className="titleText">Time Series Plot</h2>
                    <div style={{display:'flex', flexDirection:"row"}}>
                        <img src={require('../assets/Timeseries.gif')} style={{width:"50%", alignSelf:'flex-start'}} alt={'Tweet Scroller'}/>
                        <p style={{width:"50%", alignSelf:"center"}}>
                            The time series plot shows tweet volume by county over time. Mousing over the plot will
                            show a text summary of the number of tweets originating from each county on a given date.
                            The plot can also be zoomed by holding the left mouse button and dragging to a time period
                            or tweet volume range of interest. Double-clicking the map will reset the view. Note the
                            clear increase in tweet activity corresponding to peak red tides during 2018 and 2021.
							The time series plot can also be filtered to include tweets with specific words or
							phrases from the text entry box above the plot. Evaluating volume by county can also 
							suggest spatial changes in bloom impacts over time.

                            Additionally, the time series plot can also be filtered to only reflect tweets that included 
                            mentions of specific words or phrases from the text entry box above the plot. Evaluating volume
                            by county can also suggest spatial changes in bloom impacts over time.
                            
                            <li>
                                <strong> NOTE:</strong> The time series does not respond to the <strong>Time Frame and County Filters</strong>,
                                as it always depicts all five counties over the whole time span of the project on the x-axis 
                                (2018-2024). It only responds to the Account Type and With/Without Retweets filters.
                            </li>
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
