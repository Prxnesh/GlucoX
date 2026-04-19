from typing import Literal

from pydantic import BaseModel, Field


ChatRole = Literal["user", "assistant"]


class ChatMessage(BaseModel):
    role: ChatRole
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=16)
    lifestyle_profile: dict[str, str] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    message: ChatMessage
    context_summary: list[str]
    model: str
