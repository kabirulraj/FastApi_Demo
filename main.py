from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import product
from dataBase import Session, engine
import database_models
from sqlalchemy.orm import session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["http://localhost:3000"],
    allow_methods= ["*"]
)

database_models.Base.metadata.create_all(bind=engine)

@app.get("/")
def greet():
    return "hi...i'm iron man"

products = [
     product( name="Phone", description="A smartphone", price=399.99, quantity=20),
     product( name="Laptop", description="A Laptop", price=599.99, quantity=40),
     product( name="Camera", description="A Camera", price=799.99, quantity=10),
     product( name="Mouse", description="A Mouse", price=899.99, quantity=60),

]

def get_db():
    db = Session()
    try:
       yield db
    finally:
       db.close

def init_db():
    db = Session()

    count = db.query(database_models.product).count()  #doubt

    if count == 0:
      for product in products:
        db.add(database_models.product(**product.model_dump()))

    db.commit()


init_db()

@app.get("/products")
def get_all_products(db:session = Depends(get_db)):
    db_products = db.query(database_models.product).all()

    return db_products
    

 
@app.get("/products/{id}")
def get_single_product(id: int, db:session = Depends(get_db)):
    db_products = db.query(database_models.product).filter(database_models.product.id == id).first()
    if db_products:
        return db_products

    return "product not found"

#create product
@app.post("/products")
def add_product(product: product, db:session = Depends(get_db)):
    db.add(database_models.product(**product.model_dump()))
    db.commit()
    return product

#update product
@app.put("/products/{id}")
def update_product(id: int, product: product, db:session = Depends(get_db)):
    db_products = db.query(database_models.product).filter(database_models.product.id == id).first()
    if db_products:
            db_products.name = product.name
            db_products.description = product.description
            db_products.price = product.price
            db_products.quantity = product.quantity
            db.commit()
            return "Product Updated"
    else:
            return "no product found" 

#delete product
@app.delete("/products/{id}")
def delete_product(id: int, db:session = Depends(get_db)):
    db_products = db.query(database_models.product).filter(database_models.product.id == id).first()
    if db_products:
        db.delete(db_products)
        db.commit()
        return "product Deleted Successfully"
    else:
        return "Product not found"    