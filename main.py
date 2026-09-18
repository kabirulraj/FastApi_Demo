import os
import uuid
import shutil
import bcrypt
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session as OrmSession

# from passlib.context import CryptContext
from jose import jwt

from product_models import product
from user_auth_models import UserRegister, UserLogin, UserResponse
from dataBase import Session, engine
import database_models

# ── JWT config ──────────────────────────────────────────────────────────────
SECRET_KEY = "shoptrac-super-secret-key-change-in-production"
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24

# pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(plain: str) -> str:
#     return pwd_ctx.hash(plain)

# def verify_password(plain: str, hashed: str) -> bool:
#     return pwd_ctx.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(
        plain.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        plain.encode("utf-8"),
        hashed.encode("utf-8")
    )

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://127.0.0.1:3000",],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

database_models.Base.metadata.create_all(bind=engine)


def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


# ── Seed ─────────────────────────────────────────────────────────────────────
seed_products = [
    product(name="Phone",  description="A smartphone", price=399.99, quantity=20),
    product(name="Laptop", description="A Laptop",     price=599.99, quantity=40),
    product(name="Camera", description="A Camera",     price=799.99, quantity=10),
    product(name="Mouse",  description="A Mouse",      price=899.99, quantity=60),
]

def init_db():
    db = Session()
    if db.query(database_models.product).count() == 0:
        for p in seed_products:
            db.add(database_models.product(**p.model_dump()))
        db.commit()
    db.close()

init_db()


# ── Auth endpoints ────────────────────────────────────────────────────────────

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister, db: OrmSession = Depends(get_db)):
    if db.query(database_models.User).filter(database_models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = database_models.User(
        username=body.username,
    email=body.email,
    hashed_password=hash_password(body.password)

    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# @app.post("/login")
# def login(body: UserLogin, db: OrmSession = Depends(get_db)):
#     user = db.query(database_models.User).filter(database_models.User.email == body.email).first()
#     if not user or not verify_password(body.password, user.password):
#         raise HTTPException(status_code=401, detail="Invalid email or password")
#     token = create_token({"sub": str(user.id), "email": user.email, "role": user.role})
#     return {
#         "access_token": token,
#         "token_type": "bearer",
#         "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role},
#     }

@app.post("/login")
def login(body: UserLogin, db: OrmSession = Depends(get_db)):
    user = db.query(database_models.User).filter(
        database_models.User.email == body.email
    ).first()

    if not user or not verify_password(
        body.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }


# ── Misc ──────────────────────────────────────────────────────────────────────

@app.get("/")
def greet():
    return "hi...i'm iron man"


# ── Image upload ──────────────────────────────────────────────────────────────

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    ext      = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path     = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"image_url": f"/static/images/{filename}"}


# ── Product CRUD ──────────────────────────────────────────────────────────────

@app.get("/products")
def get_all_products(db: OrmSession = Depends(get_db)):
    return db.query(database_models.product).all()

@app.get("/products/{id}")
def get_single_product(id: int, db: OrmSession = Depends(get_db)):
    p = db.query(database_models.product).filter(database_models.product.id == id).first()
    return p if p else "product not found"

@app.post("/products")
def add_product(p: product, db: OrmSession = Depends(get_db)):
    db.add(database_models.product(**p.model_dump()))
    db.commit()
    return p

@app.put("/products/{id}")
def update_product(id: int, p: product, db: OrmSession = Depends(get_db)):
    row = db.query(database_models.product).filter(database_models.product.id == id).first()
    if not row:
        return "no product found"
    row.name        = p.name
    row.description = p.description
    row.price       = p.price
    row.quantity    = p.quantity
    row.image_url   = p.image_url
    db.commit()
    return "Product Updated"

@app.delete("/products/{id}")
def delete_product(id: int, db: OrmSession = Depends(get_db)):
    row = db.query(database_models.product).filter(database_models.product.id == id).first()
    if not row:
        return "Product not found"
    db.delete(row)
    db.commit()
    return "product Deleted Successfully"
