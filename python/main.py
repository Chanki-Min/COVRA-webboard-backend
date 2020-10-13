from dotenv import load_dotenv

import json
import os

load_dotenv(verbose = True)

PATH_DOWNLOAD_EXCEPT_PREDICTION = os.environ.get("PATH_DOWNLOAD_EXCEPT_PREDICTION")
PATH_DOWNLOAD_PREDICTION = os.environ.get("PATH_DOWNLOAD_PREDICTION")
PATH_DATA_JSON = os.environ.get("PATH_DATA_JSON")


def set_excution_place () :

    scriptAbsPath = os.path.abspath(__file__)
    dirname = os.path.dirname(scriptAbsPath)
    os.chdir(dirname)


def get_data_except_predict () :
    
    path_tmp = PATH_DOWNLOAD_EXCEPT_PREDICTION
    data_except_predict = None

    with open(path_tmp, mode = "r", encoding = "utf-8") as f :
        data_except_predict = f.read()
    
    return json.loads(data_except_predict)


def get_data_predict () :
    
    path_tmp = PATH_DOWNLOAD_PREDICTION
    file_tmp = None

    with open(path_tmp, mode = "r", encoding = "utf-8") as f :
        file_tmp = f.read()

    file_tmp = "{\"" + file_tmp[file_tmp.find("confirmed_death"):]

    return json.loads(file_tmp)["confirmed_death"]


def scale_to_date (scale) :

    month_scale_list = [
                    0.00,
                    0.31,
                    0.60,
                    0.91,
                    1.21,
                    1.52,
                    1.82,
                    2.13,
                    2.44,
                    2.74,
                    3.05,
                    3.35,
                    3.66
                ]
    
    for idx in range(len(month_scale_list)) :
        
        if scale < month_scale_list[idx] :
            
            year = "2020"
            
            month = str(idx)
            if idx < 10 : 
                month = "0" + month
                    
            day = str(int(round((scale - month_scale_list[idx - 1]) * 100, 2)))
            if int(day) < 10 :
                day = "0" + day
            
            return year + "-" + month + "-" + day


def make_list_data_abs_and_round (list_data) :

    list_tmp = []

    for each in list_data :
        list_tmp.append(round(abs(each)))

    return list_tmp


def preprocess_predict_data (list_confirmed_death_predicted) :
    
    json_data = {}
    
    json_data["confirmedPrediction"] = {}
    json_data["deathPrediction"] = {}


    confirmedPrediction = make_list_data_abs_and_round(list_confirmed_death_predicted[::2])
    deathPrediction = make_list_data_abs_and_round(list_confirmed_death_predicted[1::2])

    json_data["confirmedPrediction"]["global"] = confirmedPrediction
    json_data["deathPrediction"]["global"] = deathPrediction

    first_scale = 0.11
    plus_scale = round((len(list_confirmed_death_predicted[::2]) - 1) * 0.01, 2)
    end_scale = first_scale + plus_scale

    from_str = scale_to_date(first_scale)
    to_str = scale_to_date(end_scale)

    json_data["confirmedPrediction"]["from"] = from_str
    json_data["confirmedPrediction"]["to"] = to_str
    json_data["deathPrediction"]["from"] = from_str
    json_data["deathPrediction"]["to"] = to_str

    return json_data


def merge_all_data (data_except_predict, data_predict) :
    
    json_data = {}

    json_data["death"] = data_except_predict["death"]
    json_data["confirmed"] = data_except_predict["confirmed"]
    json_data["cladePopulation"] = data_except_predict["cladePopulation"]

    json_data["deathPrediction"] = data_predict["deathPrediction"]
    json_data["confirmedPrediction"] = data_predict["confirmedPrediction"]

    return json_data


def json_to_string (json_data) :
    
    naive_str_json = str(json_data)
    return naive_str_json.replace("\'", "\"")


def save_data (json_data) :
    
    path_tmp = PATH_DATA_JSON
    string_data = json_to_string(json_data)

    with open(path_tmp, mode = "w", encoding = "utf-8") as f :
        f.write(string_data)


def main () :

    set_excution_place()

    data_except_predict = get_data_except_predict()

    list_confirmed_death_predicted = get_data_predict()
    data_predict = preprocess_predict_data(list_confirmed_death_predicted)

    json_data = merge_all_data(data_except_predict, data_predict)
    save_data(json_data)


if __name__ == "__main__" :
    main()