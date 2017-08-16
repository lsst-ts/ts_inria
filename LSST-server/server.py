from flask import Flask, url_for, request
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, Float, Date, String, VARCHAR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, class_mapper
from json import dumps
from utils import serialize
import pandas as pd

from routes import app



@app.route('/')
def api_root():
    return 'Welcome'

if __name__ == '__main__':
    app.run()