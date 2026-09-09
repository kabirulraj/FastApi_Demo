from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

db_url = "mysql+pymysql://root:Raj@2001786@localhost:3306/kabirul"

engine = create_engine(db_url)

Session = sessionmaker(autocomit=False, autoflush=False, bind=engine)  