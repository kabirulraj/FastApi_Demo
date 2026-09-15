import os
import uuid
import shutil
from fastapi import Depends, FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models import product
from dataBase import Session, engine
import database_models
from sqlalchemy.orm import session

app = FastAPI()


#The Core FastAPI App

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files
UPLOAD_DIR = "static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

database_models.Base.metadata.create_all(bind=engine)


@app.get("/")
def greet():
    return "hi...i'm iron man"


seed_products = [
    product(name="Phone", description="A smartphone", price=399.99, quantity=20),
    product(name="Laptop", description="A Laptop", price=599.99, quantity=40),
    product(name="Camera", description="A Camera", price=799.99, quantity=10),
    product(name="Mouse", description="A Mouse", price=899.99, quantity=60),
]


def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


def init_db():
    db = Session()
    if db.query(database_models.product).count() == 0:
        for p in seed_products:
            db.add(database_models.product(**p.model_dump()))
    db.commit()
    db.close()


init_db()


# Upload image
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"image_url": f"/static/images/{filename}"}

# get_all_products
@app.get("/products")
def get_all_products(db: session = Depends(get_db)):
    return db.query(database_models.product).all()

# get_single_product
@app.get("/products/{id}")
def get_single_product(id: int, db: session = Depends(get_db)):
    p = db.query(database_models.product).filter(database_models.product.id == id).first()
    return p if p else "product not found"

# add_product
@app.post("/products")
def add_product(product: product, db: session = Depends(get_db)):
    db.add(database_models.product(**product.model_dump()))
    db.commit()
    return product

# update_product
@app.put("/products/{id}")
def update_product(id: int, product: product, db: session = Depends(get_db)):
    p = db.query(database_models.product).filter(database_models.product.id == id).first()
    if not p:
        return "no product found"
    p.name = product.name
    p.description = product.description
    p.price = product.price
    p.quantity = product.quantity
    p.image_url = product.image_url
    db.commit()
    return "Product Updated"

# delete_product
@app.delete("/products/{id}")
def delete_product(id: int, db: session = Depends(get_db)):
    p = db.query(database_models.product).filter(database_models.product.id == id).first()
    if not p:
        return "Product not found"
    db.delete(p)
    db.commit()
    return "product Deleted Successfully"


