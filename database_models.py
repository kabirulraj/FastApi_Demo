from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

class product(Base):
    __tablename__ = "product"

    id          = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name        = Column(String(255))
    description = Column(Text)
    price       = Column(Float)
    quantity    = Column(Integer)
    image_url   = Column(String(500), nullable=True)
