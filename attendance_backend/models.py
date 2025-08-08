from . import db
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import DateTime, String, VARBINARY, func, ForeignKey
from flask_login import UserMixin
import base64

class Base(DeclarativeBase):
  __abstract__ = True
  id: Mapped[int] = mapped_column(primary_key=True)
  created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Admin(db.Model, Base, UserMixin):
    __tablename__ = "Admin"
    
    full_name: Mapped[str] = mapped_column(String(60))
    username: Mapped[str] = mapped_column(unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(60), unique=True)
    password: Mapped[str] = mapped_column(nullable=False)
    device_id: Mapped[int] = mapped_column(ForeignKey('device.id'), unique=True)

    device = relationship('Device', back_populates='admin')


class Attendee(db.Model, Base):
   __tablename__ = "attendee"

   first_name: Mapped[str] = mapped_column(String(30))
   last_name: Mapped[str] = mapped_column(String(30))
   matric_no: Mapped[str] = mapped_column(String(8), nullable=False, unique=True)
   department: Mapped[str] = mapped_column(String(10), nullable=False)
   fingerprint: Mapped[str] = mapped_column(nullable=False)

class Device(db.Model, Base):
   __tablename__ = "device"
   device_id: Mapped[str] = mapped_column(nullable=False)
   ip_address: Mapped[str] = mapped_column(nullable=False)

   admin = relationship('Admin', back_populates='device')