import './App.css';
import Header from "./components/Header";
import Filters from "./components/Filters";
import TimeFrameSelector from "./components/TimeFrameSelector";
import Twitter from "./components/Twitter";
import {useState} from "react";
import WordCloud from "./components/WordCloud";
import GallerySwitch from "./components/Gallery";

function App() {

    const [tweets, setTweets] = useState([]);
    const Account_Type_Options = ["Academic", "Government", "Media", "Other", "Tourism"]
    const County_Options = ["Pasco", "Pinellas", "Hillsborough", "Manatee", "Sarasota"]
    const Word_Cloud_Options = ["Geo Hashtags", "Non-Geo Hashtags", 'Single Term Cloud']

    const [selectedFilters, setSelectedFilters] = useState({
        timeFrame: "2018-06-30 2024-03-03",
        accountType: [],
        county: [],
        wordCloud: [],
    });
    const handleFilterChange = (filterType, selectedOptions) => {
        setSelectedFilters(prevState => ({
            ...prevState,
            [filterType]: selectedOptions
        }));
    };

    const handleTimeFrameChange = (start, end) => {
        handleFilterChange('timeFrame', start + " " + end)
    };

    const handleTweets = (newTweets) => {
        setTweets(newTweets);
    };

    const [clickedWord, setClickedWord] = useState("")
    const handleWordClick = (word) => {
        setClickedWord(word)
    }
    


    return (
    <div className="App">
      <header className="App-header">
        <Header />
      </header>
      <div className="Filters_Bar">
          <TimeFrameSelector onTimeFrameChange={handleTimeFrameChange} />
          <Filters options={Account_Type_Options} Title={"ACCOUNT TYPE"} information={"<ul> <li><strong>Default:</strong> All Accounts are selected</li> <li><strong>Functionality:</strong> Click an option to see tweets from accounts under that category.</li> </ul>"} onChange={(selectedOptions) =>
              handleFilterChange('accountType', selectedOptions)
          } />
          <Filters options={Word_Cloud_Options} Title={"WORD CLOUD"} information={"<ul> <li><strong>Default:</strong> Non Geo Hashtags Selected\"</li>  <li><strong>Functionality:</strong> Click an option to see the counts of hashtags under that category.</li> </ul>"} onChange={(selectedOptions) => handleFilterChange('wordCloud', selectedOptions)} isMultiChoice={false} />
          <Filters options={County_Options} Title={"COUNTY"} information={"<ul> <li><strong>Default:</strong> All counties selected.</li>  <li><strong>Functionality:</strong> Upon hovering a county, the Map will display how many tweets are about that county.</li> </ul>"
          } onChange={(selectedOptions) => handleFilterChange('county', selectedOptions)} />

      </div>
      <div className="Body">

          <div className="Twitter_container">
              <Twitter selectedFilters={selectedFilters} onTweetsFetched={handleTweets} clickedWord={clickedWord} />
          </div>
          <div className="Word_Cloud_container">
              <WordCloud cloud_type={selectedFilters.wordCloud} tweets={tweets} onWordCloudClick={handleWordClick}/>
          </div>

          <div className="Map_container">
              <GallerySwitch account_types={selectedFilters.accountType} date={selectedFilters.timeFrame}/>
          </div>


      </div>
    </div>
  );
}

export default App;
