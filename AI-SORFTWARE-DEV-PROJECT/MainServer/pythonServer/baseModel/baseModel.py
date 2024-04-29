from pydantic import BaseModel
from typing import Optional

class ImgReq(BaseModel):
    imgB64:str

class cropImgReq(BaseModel):
    region:str
    imgB64:str

class checkImgRes(BaseModel):
    isPass: bool
    message: Optional[str]
    imgB64: Optional[str]

class predEmbeddedImgRes(BaseModel):
    isPass: bool
    message: Optional[str]
    embedding: Optional[str]
    
class verifyFace(BaseModel):
    coreface: str
    detectface: str