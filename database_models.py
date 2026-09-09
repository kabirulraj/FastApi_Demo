from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class product(Base) :
    id= Column(Integer, primary_key=True, Index=True)
    name= Column(String)
    description= Column(String)
    price= Column(Float)
    quantity= Column(Integer) 