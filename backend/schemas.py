from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    branch: Optional[str] = None

class BranchBase(BaseModel):
    name: str
    location: Optional[str] = None
    sip_line_id: Optional[int] = None
    status: str = "Active"

class BranchCreate(BranchBase):
    pass

class BranchOut(BranchBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class SIPLineBase(BaseModel):
    label: str
    number: str
    status: str = "Active"

class SIPLineCreate(SIPLineBase):
    pass

class SIPLineOut(SIPLineBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    login_id: str
    role: str = "Agent"
    branch_id: Optional[int] = None
    sip_extension: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    status: str = "Active"

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    last_login: Optional[datetime] = None
    branch: Optional[BranchOut] = None
    class Config:
        from_attributes = True

class DealerMobileBase(BaseModel):
    mobile: str
    label: str = "Primary"
    priority_order: int = 1
    hunt_rings: int = 3
    is_active: bool = True

class DealerMobileOut(DealerMobileBase):
    id: int
    class Config:
        from_attributes = True

class DealerBase(BaseModel):
    name: str
    branch_id: int
    email: Optional[str] = None
    sip_extension: Optional[str] = None
    priority: int = 1
    hunt_rings: int = 3
    failover_dealer_id: Optional[int] = None
    status: str = "Active"

class DealerCreate(DealerBase):
    mobiles: List[DealerMobileBase] = []

class DealerOut(DealerBase):
    id: int
    branch: Optional[BranchOut] = None
    mobiles: List[DealerMobileOut] = []
    failover: Optional["DealerOut"] = None
    class Config:
        from_attributes = True

DealerOut.model_rebuild()

class ClientBase(BaseModel):
    name: str
    mobile: str
    ucc_code: Optional[str] = None
    email: Optional[str] = None
    preferred_dealer_id: Optional[int] = None
    sip_line_id: Optional[int] = None
    branch_id: Optional[int] = None
    status: str = "Active"

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: int
    branch: Optional[BranchOut] = None
    preferred_dealer: Optional[DealerOut] = None
    sip_line: Optional[SIPLineOut] = None
    class Config:
        from_attributes = True

class CallLogBase(BaseModel):
    dealer_id: Optional[int] = None
    client_id: Optional[int] = None
    customer_number: Optional[str] = None
    call_type: str
    status: str = "Completed"
    duration_seconds: int = 0
    recording_path: Optional[str] = None
    recording_size_mb: Optional[str] = None
    sip_line_id: Optional[int] = None
    notes: Optional[str] = None

class CallLogCreate(CallLogBase):
    pass

class CallLogOut(CallLogBase):
    id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    dealer: Optional[DealerOut] = None
    client: Optional[ClientOut] = None
    class Config:
        from_attributes = True
