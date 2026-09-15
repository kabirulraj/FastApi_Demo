from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class product(Base):

    __tablename__ = "product"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255))
    description = Column(Text)
    price = Column(Float)
    quantity = Column(Integer)
    image_url = Column(String(500), nullable=True)



    # SQLAlchemy Table Definition