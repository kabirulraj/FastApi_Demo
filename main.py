from fastapi import FastAPI
from models import product
from dataBase import Session

app = FastAPI()

@app.get("/")
def greet():
    return "hi...i'm iron man"

products = [
     product(id=1, name="Phone", description="A smartphone", price=399.99, quantity=20),
     product(id=2, name="Laptop", description="A Laptop", price=599.99, quantity=40),
     product(id=3, name="Camera", description="A Camera", price=799.99, quantity=10),
     product(id=4, name="Mouse", description="A Mouse", price=899.99, quantity=60),

]


@app.get("/product")
def get_all_products():
    db = Session()
    
    return products

 
@app.get("/product/{id}")
def get_single_product(id: int):
    for product in products:
        if product.id == id:
            return product


    return "product not found"


@app.post("/product")
def add_product(product: product):
    products.append(product)
    return product


@app.put("/product")
def update_product(id: int, product: product):
    for i in range(len(products)):
        if products[i].id == id:
            products[i] = product
            return "Product Added Successfully"

    return "no product found" 


@app.delete("/product")
def delete_product(id: int):
    for i in range(len(products)):
        if products[i].id == id:
            del products[i]
            return "Product Deleted"

    return "Product not found"    