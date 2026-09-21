import os
import uuid
import shutil
import bcrypt
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, UploadFile, File, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session as OrmSession

# from passlib.context import CryptContext
from jose import jwt

from product_models import product
from user_auth_models import UserRegister, UserLogin, UserResponse, LoginResponse
from dataBase import Session, engine
import database_models

# ── JWT config ──────────────────────────────────────────────────────────────
SECRET_KEY = "shoptrac-super-secret-key-change-in-production"
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


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
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

database_models.Base.metadata.create_all(bind=engine)

def init_roles():
    db = Session()

    roles = [
        {
            "name": "user",
            "description": "Normal user"
        },
        {
            "name": "seller",
            "description": "Can manage and sell products"
        },
        {
            "name": "superadmin",
            "description": "Full system access"
        }
    ]

    for role_data in roles:

        existing_role = db.query(database_models.Role).filter(
            database_models.Role.name == role_data["name"]
        ).first()

        if not existing_role:
            role = database_models.Role(**role_data)

            db.add(role)

    db.commit()
    db.close()

init_roles()


def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: OrmSession = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(database_models.User).filter(
        database_models.User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def require_roles(*required_roles):

    def role_checker(
        current_user: database_models.User = Depends(get_current_user)
    ):
        if current_user.role.name not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker


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

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    body: UserRegister,
    db: OrmSession = Depends(get_db)
):

    existing_user = db.query(database_models.User).filter(
        database_models.User.email == body.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user_role = db.query(database_models.Role).filter(
        database_models.Role.name == "user"
    ).first()

    if not user_role:
        raise HTTPException(
            status_code=500,
            detail="Default user role not found"
        )

    user = database_models.User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
        role_id=user_role.id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@app.post("/login", response_model=LoginResponse)
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

    token = create_token({"sub": str(user.id)})

    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/me", response_model=UserResponse)
def get_me(
    current_user: database_models.User = Depends(get_current_user)
):
    return current_user



@app.get("/admin-test")
def admin_test(
    current_user: database_models.User = Depends(
        require_roles("seller", "superadmin")
    )
):
    return {
        "message": "Welcome Admin!",
        "user": current_user.username
    }

# ── Misc ──────────────────────────────────────────────────────────────────────

@app.get("/")
def greet():
    return "hi...i'm iron man"


# ── Image upload ──────────────────────────────────────────────────────────────

# @app.post("/upload-image")
# async def upload_image(file: UploadFile = File(...)):
#     ext      = os.path.splitext(file.filename)[1]
#     filename = f"{uuid.uuid4().hex}{ext}"
#     path     = os.path.join(UPLOAD_DIR, filename)
#     with open(path, "wb") as f:
#         shutil.copyfileobj(file.file, f)
#     return {"image_url": f"/static/images/{filename}"}


@app.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: database_models.User = Depends(
        require_roles("seller", "superadmin")
    )
):
    ext = os.path.splitext(file.filename)[1]

    filename = f"{uuid.uuid4().hex}{ext}"

    path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {
        "image_url": f"/static/images/{filename}",
        "created_by": current_user.username,
        "role": current_user.role.name,
    }


# ── Product CRUD ──────────────────────────────────────────────────────────────

@app.get("/products")
def get_all_products(
    db: OrmSession = Depends(get_db),
    # current_user: database_models.User = Depends(get_current_user)
):
    return db.query(database_models.product).all()

@app.get("/products/{id}")
def get_single_product(id: int, db: OrmSession = Depends(get_db)):
    p = db.query(database_models.product).filter(database_models.product.id == id).first()
    return p if p else "product not found"

@app.post("/products")
def add_product(
    p: product,
    db: OrmSession = Depends(get_db),
    current_user: database_models.User = Depends(
        require_roles("seller", "superadmin")
    )
):
    new_product = database_models.product(
        **p.model_dump()
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "message": "Product created successfully",
        "created_by": current_user.username,
        "role": current_user.role.name,
        "product": new_product
    }

# @app.put("/products/{id}")
# def update_product(id: int, p: product, db: OrmSession = Depends(get_db)):
#     row = db.query(database_models.product).filter(database_models.product.id == id).first()
#     if not row:
#         return "no product found"
#     row.name        = p.name
#     row.description = p.description
#     row.price       = p.price
#     row.quantity    = p.quantity
#     row.image_url   = p.image_url
#     db.commit()
#     return "Product Updated"

@app.put("/products/{id}")
def update_product(
    id: int,
    p: product,
    db: OrmSession = Depends(get_db),
    current_user: database_models.User = Depends(
        require_roles("superadmin")
    )
):
    row = db.query(database_models.product).filter(
        database_models.product.id == id
    ).first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    row.name = p.name
    row.description = p.description
    row.price = p.price
    row.quantity = p.quantity
    row.image_url = p.image_url

    db.commit()
    db.refresh(row)

    return {
        "message": "Product updated successfully",
        "created_by": current_user.username,
        "role": current_user.role.name,
        "product": row
    }

# @app.delete("/products/{id}")
# def delete_product(id: int, db: OrmSession = Depends(get_db)):
#     row = db.query(database_models.product).filter(database_models.product.id == id).first()
#     if not row:
#         return "Product not found"
#     db.delete(row)
#     db.commit()
#     return "product Deleted Successfully"


@app.delete("/products/{id}")
def delete_product(
    id: int,
    db: OrmSession = Depends(get_db),
    current_user: database_models.User = Depends(
        require_roles("superadmin")
    )
):
    row = db.query(database_models.product).filter(
        database_models.product.id == id
    ).first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(row)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "created_by": current_user.username,
        "role": current_user.role.name,
    }
