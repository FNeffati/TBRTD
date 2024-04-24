import re
import collections
from Locations import Locations

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import pandas as pd



class Util:
    nltk.download('stopwords')
    nltk.download('wordnet')

    geo_tag_dict = collections.defaultdict(int)
    non_geo_hashtags_dict = collections.defaultdict(int)
    pure_locations = Locations().get_pure_locations("combined")
    categorized_locations = Locations().category_adder("combined")

    @staticmethod
    def extract_hashtags(sentence):
        result = []
        for word in sentence:
            if word[0] == '#' and word not in result:
                result.append(word)
        return result

    def geo_tag_harvester(self, list_of_hashtags):
        """
        This was made to look through a sentence at a time
        :param list_of_hashtags: an array of hashatags
        :return: None, it's a counter for location hashtags
        """
        pure_set = set(self.pure_locations[0])
        padded_set = set(self.categorized_locations[0])

        for word in list_of_hashtags:
            caught = False

            for word2 in pure_set:
                if word in word2.lower() or word2.lower() in word:
                    self.geo_tag_dict[word] += 1
                    caught = True
                    break

            if not caught:
                for word2 in padded_set:
                    if word in word2.lower():
                        self.geo_tag_dict[word] += 1
                        caught = True
                        break  # Break the loop once caught

            if not caught:
                self.non_geo_hashtags_dict[word] += 1

    @staticmethod
    def filter_hashtags(tokenized_sentence):
        """
        Function to filter all the stop words and the words that we deem unnecessary/misleading the statistics
        :param tokenized_sentence: a tokenized and partially cleaned text_column from the previous function
        :return: filtered lists of words that should capture the essence of what each row was about
        """
        result = []
        for w in tokenized_sentence:
            hashtag = w
            pure_word = re.sub(r"#", "", hashtag).lower()
            approved = True
            for word in Locations().get_stop_words(True):
                if word.lower() in pure_word:
                    approved = False
            if approved:
                result.append(pure_word.lower())

        return result

    @staticmethod
    def get_single_term_words():
        geo_terms = []
        geo_list = Locations().get_pure_locations(" ")
        for item in geo_list:
            for word in item:
                geo_terms.append(word)
        polit_terms = ["democrat", "democratic", "republican", "gop", "demcastfl",
                       "vote blue", "vote red", "red wave", "blue wave",
                       "right wing", "left wing", "far right", "far left", "extreme right", "extreme left",
                       "supremacy", "supremacist", "supremacys", "supremacists", "terrorist", "terrorism", "terrorists",
                       "ron desantis", "desantis", "remove ron", "deathsantis",
                       "rick scott", "red tide rick",
                       "marco rubio", "rubio",
                       "bill nelson",
                       "donald trump", "trump",
                       "mike pence", "pence",
                       "joe biden", "biden",
                       "kamala harris",
                       "crist", "charlie christ",
                       "andrew gillum", "gillum",
                       "kriseman", "richard kriseman",  # Past mayor of St Pete
                       "ken welch",  # Current mayor of St Pete
                       "george cretekos", "cretekos",  # Mayor of Clearwater
                       "buckhorn", "bob buckhorn",  # Past mayor of Tampa
                       "jane castor", "castor",  # Current mayor of Tampa
                       "john holic", "holic",  # Past mayor of Venice
                       "ron feinsod"]
        max_words = 50
        n_orig_cutoff = 5
        exclude_retweets = True
        lemmatize = True
        account_labels = pd.read_csv("./cloud_functions/Finalized_Labeled_Accounts_EMOJIS_UNCHANGED.csv")
        account_labels = pd.concat([account_labels, pd.read_csv("./cloud_functions/SVM_BERT_Predictions_for_Unlabeled_Accounts_EMOJIS_UNCHANGED.csv")])

        main_queries = {
            "RedTide": '("red tide" OR "red tides" OR "red algae" OR #redtide OR "karenia brevis" OR kbrevis OR #kareniabrevis)',
            "AllAlgae": '((algae OR algal OR #algaebloom OR #algalbloom OR #toxicalgae OR #harmfulalgae) OR ("red tide" OR '
                        '"red tides" OR #redtide OR "karenia brevis" OR kbrevis OR #kareniabrevis) OR (#bluegreenalgae OR '
                        'cyanobacteria OR cyanotoxins OR Lyngbya OR Dapis))'
        }

        area_terms = {
            "Tampa": '(Tampa OR Tampas OR #TampaBay OR "TB area" OR ((Hillsborough OR HillsboroughCounty) (FL OR Florida OR '
                     'Bay)) OR "Apollo Beach" OR #ApolloBeach OR Wimauma OR ((Gibsonton OR Ruskin OR "Sun City") (FL OR '
                     'Florida)) OR "Davis Islands" OR "Alafia River" OR "McKay Bay")',
            "Pinellas.Clearwater": '(Pinellas OR PinellasCounty OR ((Clearwater OR Dunedin) (FL OR Florida)) OR "Clearwater '
                                   'Beach" OR #ClearwaterBeach OR "Indian Rocks Beach" OR #IndianRocksBeach OR "Tarpon '
                                   'Springs" OR #TarponSprings OR Belleair OR "Palm Harbor" OR #PalmHarbor OR "Safety Harbor")',
            "StPete": '(StPetersburg OR "St Petersburg" OR "St Pete" OR StPete OR #StPeteBeach OR "Madeira Beach" OR '
                      '#MadeiraBeach OR (("Treasure Island" OR "Tierra Verde") (FL OR Florida)) OR "Sunshine Skyway" OR "Fort '
                      'De Soto" OR (Redington (Beach OR Shores)) OR "Pass a grille")',
            "Manatee": '("Manatee county" OR ManateeCounty OR Bradenton OR Bradentons OR #BradentonBeach OR "Anna Maria '
                       'Island" OR #AnnaMariaIsland OR "Longboat Key" OR #LongboatKey OR "Holmes Beach" OR #HolmesBeach OR '
                       '"Manatee River" OR #ManateeRiver OR "Port Manatee")',
            "Sarasota": '(Sarasota OR Sarasotas OR SarasotaCounty OR "Siesta Key Beach" OR #SiestaKeyBeach OR ((Venice OR '
                        'Englewood OR "North Port" OR #NorthPort OR "Lido Beach") (FL OR Florida)) OR "Casey Key" OR '
                        '#CaseyKey OR Nokomis OR "Lemon Bay" OR #LemonBay OR "St Armands")',
            "Pasco": '(((Pasco (county OR counties OR Florida OR FL)) OR PascoCounty OR "Port Richey" OR #PortRichey OR (('
                     '"Bayonet Point" OR Anclote OR Elfers OR "Shady Hills") (FL OR Florida)) OR "Cotee River" OR '
                     'Pithlachascotee OR "Jasmine Estates" OR Aripeka -@Lou_Port_Richey)'
        }

        full_df = pd.DataFrame()
        for k in range(1, 7):
            mq = list(main_queries.keys())
            at = list(area_terms.keys())
            try:
                file_path = f"./cloud_functions/data/{mq[0]}_{at[k - 1]}_all_SIMPLE_columns.csv"
                interm_df = pd.read_csv(file_path)
                full_df = pd.concat([full_df, interm_df[
                    ['id', 'username', 'text', 'text_with_display_links', 'created_at.x', 'verified',
                     'public_metrics.x_retweet_count']]])
                print("Found and processed ", file_path)
            except Exception as e:
                print(e)

        full_df = full_df.merge(account_labels[['username', 'hand.label_simplified']], on='username', how='left')
        full_df = full_df[~full_df['hand.label_simplified'].isna()]

        full_df.drop_duplicates(inplace=True)
        full_df = full_df[full_df['hand.label_simplified'].isin(['acad', 'gov', 'media', 'other', 'tourbiz'])]
        start_time = pd.to_datetime('2018-01-01')
        end_time = pd.to_datetime('2023-01-01')
        full_df['created_at.x'] = pd.to_datetime(full_df['created_at.x'])
        our_df = full_df[(full_df['created_at.x'] >= start_time) & (full_df['created_at.x'] <= end_time)]
        our_df = our_df[~our_df['text'].str.startswith('RT @')]

        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r'https?://\S+', '',
                                                                                          regex=True)
        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r'^RT @[^ ]* ', '',
                                                                                          regex=True)
        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r'@[^ ]* ', '', regex=True)
        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r'-', ' ', regex=True)
        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r'[ \t]+$', '', regex=True)
        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r"'", "'", regex=True)

        legitimate_s = ["it's", "that's", "there's", "here's", "he's", "she's", "what's", "where's", "who's", "let's",
                        "when's", "why's", "how's"]
        for word in legitimate_s:
            our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(f"{word}",
                                                                                              word.replace("'", ""),
                                                                                              regex=True)
        our_df['text_with_display_links'] = our_df['text_with_display_links'].str.replace(r"('s)([^a-zA-Z0-9])", r"\2",
                                                                                          regex=True)

        def lemmatize_text(text):
            lemmatizer = WordNetLemmatizer()
            lemmatized_text = [lemmatizer.lemmatize(word) for word in text.split()]
            return ' '.join(lemmatized_text)

        if lemmatize:
            our_df['text_with_display_links'] = our_df['text_with_display_links'].apply(
                lemmatize_text)  # You said this was time consuming? It is indeed taking 700 ms more than other stuff

        print(f"N of distinct tweets with URL links & stuff: {our_df['text'].nunique()}")

        result = [{"text": "Empty", "value": 10}]
        if our_df.shape[0] > 0:
            print(our_df.shape)
            print(f"Head (created_at.x): {our_df['created_at.x'].head(1).values[0]}")
            print(f"Tail (created_at.x): {our_df['created_at.x'].tail(1).values[0]}")

            if our_df['text_with_display_links'].nunique() >= n_orig_cutoff:
                our_stopwords = set(stopwords.words('english'))
                our_stopwords.add('amp')

                # Not that crazy time-consuming in Python God bless
                geo_terms_pattern = r'\b(?:{})\b'.format(r'|'.join(geo_terms))
                polit_terms_pattern = r'\b(?:{})\b'.format(r'|'.join(polit_terms))
                red_tide_terms_pattern = r'\b(?:red tide|red tides|karenia brevis|red algae|redtide|redtide\'s|kbrevis|karenia|brevis|kareniabrevis|redalgae)\b'
                pattern = r'|'.join([geo_terms_pattern, polit_terms_pattern, red_tide_terms_pattern])
                string_for_tokenization = our_df['text_with_display_links'].str.lower().replace(pattern, 'na',
                                                                                                regex=True)
                string_for_tokenization = string_for_tokenization.replace(r'\bna\'s\b', 'na', regex=True)

                if lemmatize:
                    string_for_tokenization = string_for_tokenization.apply(lemmatize_text)

                """
                bad_punct = ['!', '$', '%', '(', ')', '.', ':', ';', '?', ',', '[', ']', '{', '|', '}']
                for char in bad_punct:
                    try:
                        string_for_tokenization = string_for_tokenization.replace(char, ' na ', regex=True)
                    except Exception as e:
                        print("There has been an exception: ", e)
                """

                tokenized_text = string_for_tokenization.str.split()
                tokenized_text = tokenized_text.apply(
                    lambda x: [word for word in x if word.lower() not in our_stopwords])
                tokenized_text = tokenized_text.apply(lambda x: [word for word in x if word != '#na'])
                tokenized_text = tokenized_text.apply(lambda x: [word for word in x if word != 'na'])
                tokenized_term_counts = pd.Series(tokenized_text.explode()).value_counts()

                term_counts = tokenized_term_counts[~tokenized_term_counts.index.isin(
                    geo_terms + ['redtide', 'kbrevis', 'karenia', 'brevis', 'kareniabrevis', 'redalgae'])]
                print(term_counts.head(10))
                # Doesn't seem to be removing stop words, I couldn't even find where you remove the stop words in R???

                result = [{"text": key, "value": value} for key, value in term_counts.items()]
        return result
