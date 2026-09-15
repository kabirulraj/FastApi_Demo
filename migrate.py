from dataBase import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE product ADD COLUMN image_url VARCHAR(500) NULL"))
    conn.commit()
    print("image_url column added successfully")



    # One-time DB Migration
