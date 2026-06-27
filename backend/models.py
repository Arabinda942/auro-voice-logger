from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200))
    sip_line_id = Column(Integer, ForeignKey("sip_lines.id"), nullable=True)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sip_line = relationship("SIPLine", back_populates="branches")
    users = relationship("User", back_populates="branch")
    dealers = relationship("Dealer", back_populates="branch")
    clients = relationship("Client", back_populates="branch")

class SIPLine(Base):
    __tablename__ = "sip_lines"
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(50), nullable=False)
    number = Column(String(30), nullable=False)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    branches = relationship("Branch", back_populates="sip_line")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    login_id = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="Agent")
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    sip_extension = Column(String(10))
    email = Column(String(100))
    mobile = Column(String(20))
    status = Column(String(20), default="Active")
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    branch = relationship("Branch", back_populates="users")
    dealer = relationship("Dealer", back_populates="user", uselist=False)

class Dealer(Base):
    __tablename__ = "dealers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)
    email = Column(String(100))
    sip_extension = Column(String(10))
    priority = Column(Integer, default=1)
    hunt_rings = Column(Integer, default=3)
    failover_dealer_id = Column(Integer, ForeignKey("dealers.id"), nullable=True)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    branch = relationship("Branch", back_populates="dealers")
    user = relationship("User", back_populates="dealer")
    mobiles = relationship("DealerMobile", back_populates="dealer", cascade="all, delete-orphan")
    failover = relationship("Dealer", remote_side=[id], foreign_keys=[failover_dealer_id])
    calls = relationship("CallLog", back_populates="dealer")

class DealerMobile(Base):
    __tablename__ = "dealer_mobiles"
    id = Column(Integer, primary_key=True, index=True)
    dealer_id = Column(Integer, ForeignKey("dealers.id", ondelete="CASCADE"), nullable=False)
    mobile = Column(String(20), nullable=False)
    label = Column(String(30), default="Primary")
    priority_order = Column(Integer, default=1)
    hunt_rings = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)

    dealer = relationship("Dealer", back_populates="mobiles")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(20), nullable=False)
    ucc_code = Column(String(50), unique=True, nullable=True)
    email = Column(String(100))
    preferred_dealer_id = Column(Integer, ForeignKey("dealers.id"), nullable=True)
    sip_line_id = Column(Integer, ForeignKey("sip_lines.id"), nullable=True)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    status = Column(String(20), default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    branch = relationship("Branch", back_populates="clients")
    preferred_dealer = relationship("Dealer")
    sip_line = relationship("SIPLine")
    calls = relationship("CallLog", back_populates="client")

class CallLog(Base):
    __tablename__ = "call_logs"
    id = Column(Integer, primary_key=True, index=True)
    dealer_id = Column(Integer, ForeignKey("dealers.id"), nullable=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    customer_number = Column(String(20))
    call_type = Column(String(20))
    status = Column(String(20), default="Completed")
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    recording_path = Column(String(500), nullable=True)
    recording_size_mb = Column(String(10), nullable=True)
    sip_line_id = Column(Integer, ForeignKey("sip_lines.id"), nullable=True)
    notes = Column(Text, nullable=True)

    dealer = relationship("Dealer", back_populates="calls")
    client = relationship("Client", back_populates="calls")
