from datetime import datetime
from bson import json_util
from flask import jsonify
from util import Util
import pymongo
import time
import json
import re


class Analysis:
    MONGO_URI = "mongodb+srv://Neffati:y4m4SKKmoIg6riCP@cluster0.h1xa7vw.mongodb.net/?retryWrites=true&w=majority"
    connection = pymongo.MongoClient(MONGO_URI)

    # @staticmethod
    # def preprocess_text_column(just_text_col):
    #     """
    #     :param just_text_col: Takes just the entire text column from the dataframe
    #     """
    #     tokenized_text_column = []
    #     for line in just_text_col:
    #         my_punct = ['!', '"', '$', '%', '&', "'", '(', ')', '*', '+', ',', '.',
    #                     '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '-',
    #                     '`', '{', '|', '}', '~', '»', '«', '“', '”']
    #
    #         punct_pattern = re.compile("[" + re.escape("".join(my_punct)) + "]")
    #         line = re.sub(punct_pattern, "", line)
    #         line = re.sub(r"/[^\w\s\']|_/g, """, "", line)
    #         line = re.sub(r"/\s+/g, " "", "", line)
    #         line = re.sub(r"(https|www).*com", "", line)
    #         line = re.sub(r"\s+", " ", line)
    #         tokenized_text = line.split()
    #
    #         if tokenized_text not in tokenized_text_column:
    #             hashtags = Util().extract_hashtags(tokenized_text)
    #             filtered_tags = Util().filter_hashtags(hashtags)
    #             Util().geo_tag_harvester(filtered_tags)
    #             tokenized_text_column.append(tokenized_text)

    # def analyze_files(self, df):
    #
    #     just_text_col = []
    #     # for line in df["text"]:
    #     for line in df:
    #         line = re.sub(r'\bhttps\w*\b.*', '', line)
    #         line = re.sub(r'\bhttp\w*\b.*', '', line)
    #
    #         just_text_col.append(line)
    #
    #     self.preprocess_text_column(just_text_col)

    def get_filtered_tweets(self, time_frame=None, counties=None, account_type_list=None):
        """
        We want this function to filter based on requested params
        :param account_type_list: what type of account is sending out the tweets
        :param time_frame: this either goes in increments of 1 Day, week, month, year
                    or the user can give you a custom upper and lower bound
        :param counties: a single or list of selected florida counties that we will filter from
        :return: a dataframe with those rows
        """
        db = self.connection.tweets
        tweets = db.all_tweets
        query = {}

        account_types = {
            "government": "gov",
            "academic": "acad",
            "media": "media",
            "tourism": "tourism",
            "other": "other"
        }
        # print(time_frame, counties, account_type_list)

        if counties or account_type_list or time_frame:
            if account_type_list:
                if len(account_type_list) > 0:
                    current_account_types = [account_types[account.lower()] for account in account_type_list]
                    query["label"] = {"$in": current_account_types}
                else:
                    query = {}
            if len(time_frame) == 2:
                start_date_str, end_date_str = time_frame
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
                query['time'] = {'$gte': start_date, '$lt': end_date}

            if counties:
                query["location"] = {"$in": counties}

            cursor = tweets.find(query)
        else:
            cursor = tweets.find()

        results = []
        for doc in cursor:
            del doc["_id"]
            json_string = json.dumps(doc, default=json_util.default)
            results.append(json_string)

        print("------------------------------------------")
        print("LENGTH:", len(results))
        print("------------------------------------------")

        json_array = '[' + ', '.join(results) + ']'
        return json_array

    # @staticmethod
    # def get_key_words_frequency(tweets, type_of_cloud):
    #     time.sleep(1)
    #     data = [tweet['text'] for tweet in tweets]
    #     Analysis().analyze_files(data)
    #     result = None
    #
    #     if 'Non-Geo' in type_of_cloud:
    #         non_geo = Util().non_geo_hashtags_dict
    #         result = [{"text": key, "value": value} for key, value in non_geo.items()]
    #         Util().non_geo_hashtags_dict.clear()
    #     elif 'Geo' in type_of_cloud:
    #         geo = Util().geo_tag_dict
    #         result = [{"text": key, "value": value} for key, value in geo.items()]
    #         Util().geo_tag_dict.clear()
    #     elif 'Single' in type_of_cloud:
    #         result = Util().get_single_term_words()
    #
    #     return jsonify({"value1": result})
