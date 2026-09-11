from pydantic import BaseModel
from typing import Optional

class product(BaseModel) :
    id: Optional[int] = None
    name: str
    description: str
    price: float
    quantity: int

